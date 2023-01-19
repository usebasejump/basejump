import { useLocalStorage } from "react-use";
import { useTheme } from "react-daisyui";
import { useEffect } from "react";

const THEME_STORAGE_KEY = "basejump-theme";
export default function useThemeStorage(defaultTheme?: string) {
  const [value, setValue, remove] = useLocalStorage(
    THEME_STORAGE_KEY,
    defaultTheme
  );
  const { theme, setTheme } = useTheme(value);

  useEffect(() => {
    setTheme(value);
  }, [value, setTheme]);

  function setInternalTheme(theme: string) {
    setValue(theme);
  }

  return { theme, setTheme: setInternalTheme, clearTheme: remove };
}
