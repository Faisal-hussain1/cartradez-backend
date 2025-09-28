exports.prepareVehiclesData = ({data}) => {
  const preparedVehiclesData = [];
  for (const vehicle of data) {
    preparedVehiclesData.push({
      id: vehicle._id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      mileage: vehicle.mileage,
      price: vehicle.price,
      currency: vehicle.currency,
      images: vehicle.images,
      engineSize: vehicle.engineSize,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,

      isFeatured: vehicle.isFeatured,
      isGreatPrice: vehicle.isGreatPrice,
      status: vehicle.status,

      // body: vehicle.body,
      // seats: vehicle?.seats,
      // doors: vehicle?.doors,
      // numberPlate: vehicle?.numberPlate,
      // cylinder: vehicle?.cylinder,
      // modelDetail: vehicle?.modelDetail,
      // importHistory: vehicle?.importHistory,
      // location: vehicle?.location,
    });
  }

  return preparedVehiclesData;
};
