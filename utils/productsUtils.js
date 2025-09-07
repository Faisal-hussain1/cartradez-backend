exports.prepareProductsData = ({data}) => {
  const preparedProductsData = [];
  for (const product of data) {
    preparedProductsData.push({
      id: product._id,
      title: product.title,
      price: product.price,
      description: product.description,
      condition: product.condition,
      location: product.location,
      brand: product.brand,
      model: product.model,
      year: product.year,
      mileage: product.mileage,
      fuelType: product.fuelType,
      transmission: product.transmission,
      color: product.color,
      status: product.status,
      isFeatured: product.isFeatured,
      images: product.images,
    });
  }

  return preparedProductsData;
};
