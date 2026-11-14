const vehicles = [
  { id: 15175, name: "BMW M5 F90 CS", speed: 300, drive: "полный", tank: 68, price: 3490, crop: [929, 12, 81, 635] },
  { id: 15659, name: "BMW G90 Mansory", speed: 325, drive: "передний", tank: 67, price: 4790, crop: [909, 5, 50, 635] },
  { id: 15636, name: "BMW M3 G80 CS", speed: 307, drive: "задний", tank: 65, price: 3790, crop: [880, 0, 93, 635] },
  { id: 15229, name: "Mercedes-Benz CLK-GTR", speed: 335, drive: "задний", tank: 90, price: 5490, crop: [858, 6, 82, 635] },
];

function vehiclePhoto(car) {
  const frame = document.createElement("div");
  const image = document.createElement("img");
  const [width, left, top, cropWidth] = car.crop;
  frame.style.cssText = "position:relative;overflow:hidden;aspect-ratio:16/9;background:#101721";
  image.src = "assets/car-" + car.id + ".png";
  image.alt = car.name;
  image.loading = "lazy";
  image.style.cssText = `position:absolute;max-width:none;height:auto;width:${100 * width / cropWidth}%;left:${-100 * left / cropWidth}%;top:${-100 * top / (cropWidth * 9 / 16)}%`;
  frame.append(image);
  return frame;
}
