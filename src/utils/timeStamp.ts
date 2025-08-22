export const getFormattedDateWithTime = () => {
  const currentDate = new Date();

  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear().toString();
  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  const seconds = currentDate.getSeconds().toString().padStart(2, '0');
  const meridiem = Number(hours) >= 12 ? 'PM' : 'AM';

  const formattedDate = `${day}_${month}_${year}_${hours}:${minutes}:${seconds}_${meridiem}`;

  return formattedDate;
};
