import {
  useEffect,
  useState,
} from "react";

import {
  getMandalConfig,
} from "../utils/mandalConfig";


const useMandalConfig = () => {

  const [
    mandalConfig,
    setMandalConfig,
  ] = useState(
    () => getMandalConfig()
  );


  useEffect(() => {

    const handleUpdate = (event) => {

      // Event मधून config मिळाला तर तोच वापर
      if (event?.detail) {

        setMandalConfig(
          event.detail
        );

        return;
      }


      // Otherwise localStorage मधून reload
      setMandalConfig(
        getMandalConfig()
      );
    };


    window.addEventListener(
      "mandal-data-updated",
      handleUpdate
    );


    window.addEventListener(
      "mandal-settings-updated",
      handleUpdate
    );


    window.addEventListener(
      "storage",
      handleUpdate
    );


    return () => {

      window.removeEventListener(
        "mandal-data-updated",
        handleUpdate
      );


      window.removeEventListener(
        "mandal-settings-updated",
        handleUpdate
      );


      window.removeEventListener(
        "storage",
        handleUpdate
      );

    };

  }, []);


  return mandalConfig;
};


export default useMandalConfig;