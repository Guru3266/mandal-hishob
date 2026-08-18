export const DEFAULT_MANDAL = {
  name: "मंडळाचे नाव",
  tagline: "गणपती उत्सव 2026",
  address: "",
  mobile: "",
};

export const getMandalConfig = () => {
  try {
    const savedConfig =
      localStorage.getItem("mandalConfig");

    if (!savedConfig) {
      return DEFAULT_MANDAL;
    }

    const parsedConfig =
      JSON.parse(savedConfig);

    return {
      ...DEFAULT_MANDAL,
      ...parsedConfig,
    };

  } catch (error) {

    console.error(
      "Error loading mandal config:",
      error
    );

    return DEFAULT_MANDAL;
  }
};


export const saveMandalConfig = (config) => {

  try {

    const finalConfig = {
      ...DEFAULT_MANDAL,
      ...config,
    };

    localStorage.setItem(
      "mandalConfig",
      JSON.stringify(finalConfig)
    );

    return finalConfig;

  } catch (error) {

    console.error(
      "Error saving mandal config:",
      error
    );

    return DEFAULT_MANDAL;
  }

};


export const clearMandalConfig = () => {

  localStorage.removeItem(
    "mandalConfig"
  );

};