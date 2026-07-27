const dns = require('node:dns');
const mongoose = require('mongoose');

dns.setServers(['1.1.1.1', '8.8.8.8']);

const VehiclesModel = require('../models/VehiclesModel');

// DRY_RUN=true:
// Sirf proposed slugs show honge, database update nahi hoga.
//
// DRY_RUN=false:
// Database update hoga, lekin additional confirmation bhi required hogi.
const DRY_RUN = process.env.DRY_RUN !== 'false';

const LIVE_MIGRATION_CONFIRMED =
  process.env.CONFIRM_PRODUCTION_SLUG_MIGRATION === 'YES';

const createVehicleSlug = (...parts) => {
  return parts
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
};

const getUniqueSlug = (baseSlug, reservedSlugs) => {
  let finalSlug = baseSlug;
  let duplicateNumber = 2;

  while (reservedSlugs.has(finalSlug)) {
    finalSlug = `${baseSlug}-${duplicateNumber}`;
    duplicateNumber += 1;
  }

  reservedSlugs.add(finalSlug);

  return finalSlug;
};

const backfillVehicleSlugs = async () => {
  try {
    const mongoUri = process.env.MONGO_DB_CONNECT_STRING;

    if (!mongoUri) {
      throw new Error(
        'MONGO_DB_CONNECT_STRING was not loaded from the .env file.',
      );
    }

    if (!DRY_RUN && !LIVE_MIGRATION_CONFIRMED) {
      throw new Error(
        'Production migration confirmation is missing. No data was changed.',
      );
    }

    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB.');
    console.log(`Database: ${mongoose.connection.name}`);

    if (DRY_RUN) {
      console.log('DRY RUN MODE: No database records will be changed.');
    } else {
      console.log('LIVE MODE: Vehicle slugs will be saved.');
    }

    // Collection directly use ki gayi hai taa-ke application ke
    // filters, loggers aur route configuration load na hon.
    const vehicles = await VehiclesModel.collection
  .find(
    {
      $and: [
        {
          $or: [
            {slug: {$exists: false}},
            {slug: null},
            {slug: ''},
          ],
        },
        {
          model: {
            $not: /^perf-/i,
          },
        },
      ],
    },
        {
          projection: {
            _id: 1,
            year: 1,
            make: 1,
            model: 1,
            variant: 1,
            registrationCity: 1,
          },
        },
      )
      .toArray();

    const existingSlugs = await VehiclesModel.collection.distinct('slug', {
      slug: {
        $exists: true,
        $nin: [null, ''],
      },
    });

    const reservedSlugs = new Set(existingSlugs);
    const updates = [];

    let skippedCount = 0;

    console.log(`${vehicles.length} vehicles without slugs found.`);

    for (const vehicle of vehicles) {
      const baseSlug = createVehicleSlug(
        vehicle.year,
        vehicle.make,
        vehicle.model,
        vehicle.variant,
        vehicle.registrationCity,
      );

      if (!baseSlug) {
        skippedCount += 1;
        console.warn(`Skipped vehicle: ${vehicle._id}`);
        continue;
      }

      const slug = getUniqueSlug(baseSlug, reservedSlugs);

      console.log(`${vehicle._id} → ${slug}`);

      updates.push({
        updateOne: {
          filter: {
            _id: vehicle._id,
            $or: [
              {slug: {$exists: false}},
              {slug: null},
              {slug: ''},
            ],
          },
          update: {
            $set: {
              slug,
            },
          },
        },
      });
    }

    if (DRY_RUN) {
      console.log('');
      console.log('Dry run completed successfully.');
      console.log(`Ready to update: ${updates.length}`);
      console.log(`Skipped: ${skippedCount}`);
      console.log('No database records were changed.');
      return;
    }

    if (updates.length === 0) {
      console.log('No vehicles require slug updates.');
      return;
    }

    const result = await VehiclesModel.collection.bulkWrite(updates, {
      ordered: true,
    });

    console.log('');
    console.log('Slug migration completed successfully.');
    console.log(`Updated: ${result.modifiedCount}`);
    console.log(`Skipped: ${skippedCount}`);
  } catch (error) {
    console.error('');
    console.error('Slug migration failed:');
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed.');
    }
  }
};

backfillVehicleSlugs();