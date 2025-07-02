import React from "react";
import {
  AppBar,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  Box,
  Autocomplete,
  TextField,
} from "@mui/material";

export default function TopBannerBar({
  language,
  setLanguage,
  exerciseIds,
  searchSelected,
  searchValue,
  setSearchValue,
  handleSearchSelect,
  i18nMap,
}) {
  // Translation map for search bar label
  const searchLabel =
    language && language.toLowerCase() === "pt" ? "Buscar exercícios" : "Search exercises";

  // Helper to get the display name for an exercise
  function getDisplayName(exerciseId) {
    if (
      language &&
      language.toLowerCase() !== "en" &&
      i18nMap &&
      i18nMap[exerciseId] &&
      i18nMap[exerciseId][language.toLowerCase()]
    ) {
      return i18nMap[exerciseId][language.toLowerCase()];
    }
    // Fallback to English if available
    if (i18nMap && i18nMap[exerciseId] && i18nMap[exerciseId]["en"]) {
      return i18nMap[exerciseId]["en"];
    }
    // Fallback to ID if no name is available
    return String(exerciseId);
  }

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 0, p: 0 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 0 }}>
        {/* Language switcher on the left */}
        <FormControl sx={{ minWidth: 100, ml: 2 }} size="small">
          <Select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            displayEmpty
          >
            <MenuItem value="EN">🇬🇧 EN</MenuItem>
            <MenuItem value="PT">🇵🇹 PT</MenuItem>
          </Select>
        </FormControl>
        {/* Spacer to push search bar to the right */}
        <Box sx={{ flex: 1 }} />
        {/* Search bar on the right */}
        <Autocomplete
          freeSolo
          options={exerciseIds}
          value={searchSelected}
          inputValue={searchValue}
          onInputChange={(_, newInputValue) => setSearchValue(newInputValue)}
          onChange={handleSearchSelect}
          sx={{ width: 630, mr: { md: 4, xs: 2 } }}
          getOptionLabel={(option) => getDisplayName(option)}
          renderOption={(props, option) => <li {...props}>{getDisplayName(option)}</li>}
          renderInput={(params) => (
            <TextField {...params} label={searchLabel} variant="outlined" size="small" />
          )}
        />
      </Toolbar>
    </AppBar>
  );
}
