exports.prepareVehiclesData = ({data}) => {
  const preparedVehiclesData = [];
  for (const vehicle of data) {
    preparedVehiclesData.push({
      id: vehicle._id,
      name: vehicle.name,
      price: vehicle.price,
      description: vehicle.description,
      condition: vehicle.condition,
      location: vehicle.location,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      color: vehicle.color,
      status: vehicle.status,
      isFeatured: vehicle.isFeatured,
      images: vehicle.images,
    });
  }

  return preparedVehiclesData;
};
