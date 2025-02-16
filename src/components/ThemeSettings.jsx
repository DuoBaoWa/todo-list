import React from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { ChromePicker } from 'react-color';

const ThemeSettings = ({
  darkMode,
  onToggleDarkMode,
  primaryColor,
  secondaryColor,
  onPrimaryColorChange,
  onSecondaryColorChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [colorPickerType, setColorPickerType] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setColorPickerType(null);
  };

  const handleColorPickerOpen = (type) => {
    setColorPickerType(type);
  };

  const handleColorChange = (color) => {
    if (colorPickerType === 'primary') {
      onPrimaryColorChange(color.hex);
    } else if (colorPickerType === 'secondary') {
      onSecondaryColorChange(color.hex);
    }
  };

  return (
    <Box>
      <IconButton onClick={handleClick} color="inherit">
        <PaletteIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem>
          <Typography>深色模式</Typography>
          <Switch
            checked={darkMode}
            onChange={onToggleDarkMode}
            color="primary"
          />
        </MenuItem>
        <MenuItem onClick={() => handleColorPickerOpen('primary')}>
          <Typography>主要颜色</Typography>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              ml: 1,
              bgcolor: primaryColor,
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleColorPickerOpen('secondary')}>
          <Typography>次要颜色</Typography>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 1,
              ml: 1,
              bgcolor: secondaryColor,
            }}
          />
        </MenuItem>
        {colorPickerType && (
          <Box sx={{ p: 2 }}>
            <ChromePicker
              color={colorPickerType === 'primary' ? primaryColor : secondaryColor}
              onChange={handleColorChange}
            />
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default ThemeSettings;