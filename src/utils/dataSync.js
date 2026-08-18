const DATA_CHANGE_EVENT = "mandalDataUpdated";


export const notifyDataChange = () => {
  window.dispatchEvent(
    new Event(DATA_CHANGE_EVENT)
  );
};


export const saveData = (
  key,
  data
) => {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(data)
    );

    notifyDataChange();

    return true;

  } catch (error) {

    console.error(
      `Unable to save ${key}:`,
      error
    );

    return false;

  }
};


export const readData = (
  key,
  fallback = []
) => {

  try {

    const stored =
      localStorage.getItem(key);

    if (!stored) {
      return fallback;
    }

    const parsed =
      JSON.parse(stored);

    return parsed;

  } catch (error) {

    console.error(
      `Unable to read ${key}:`,
      error
    );

    return fallback;

  }

};


export const removeData = (
  key
) => {

  try {

    localStorage.removeItem(key);

    notifyDataChange();

    return true;

  } catch (error) {

    console.error(
      `Unable to remove ${key}:`,
      error
    );

    return false;

  }

};


export const addData = (
  key,
  newItem
) => {

  const existingData =
    readData(key, []);

  const updatedData = [
    ...existingData,
    newItem,
  ];

  return saveData(
    key,
    updatedData
  );

};


export const updateData = (
  key,
  updatedItem
) => {

  const existingData =
    readData(key, []);

  const updatedData =
    existingData.map(
      (item) =>
        item.id === updatedItem.id
          ? updatedItem
          : item
    );

  return saveData(
    key,
    updatedData
  );

};


export const deleteData = (
  key,
  id
) => {

  const existingData =
    readData(key, []);

  const updatedData =
    existingData.filter(
      (item) =>
        item.id !== id
    );

  return saveData(
    key,
    updatedData
  );

};