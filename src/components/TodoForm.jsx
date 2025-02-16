import React, { useState } from 'react';
import {
  TextField,
  Stack,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const PRIORITY_LEVELS = [
  { value: 'high', label: '高', color: '#f44336' },
  { value: 'medium', label: '中', color: '#ff9800' },
  { value: 'low', label: '低', color: '#4caf50' },
];

function TodoForm({ onSubmit }) {
  const [newTodo, setNewTodo] = useState('');
  const [newTodoPomodoroCount, setNewTodoPomodoroCount] = useState(1);
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    onSubmit({
      text: newTodo,
      pomodoroCount: newTodoPomodoroCount,
      priority,
      tags,
    });

    setNewTodo('');
    setTags([]);
    setPriority('medium');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: { xs: 2, sm: 3 }, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#fff', borderRadius: 2, boxShadow: 1 }}>
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="添加新的待办事项"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover': {
                  '& > fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton type="submit" color="primary" disabled={!newTodo.trim()}>
                  <AddIcon />
                </IconButton>
              ),
            }}
          />
          <TextField
            type="number"
            variant="outlined"
            label="番茄钟数量"
            value={newTodoPomodoroCount}
            onChange={(e) =>
              setNewTodoPomodoroCount(Math.max(1, parseInt(e.target.value) || 1))
            }
            sx={{ width: { xs: '100%', sm: '120px' } }}
            InputProps={{
              inputProps: { min: 1 },
            }}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth sx={{ 
            minWidth: { xs: '100%', sm: 120 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: { xs: '16px', sm: 'inherit' }
            },
            '& .MuiSelect-select': {
              padding: { xs: '10px 14px', sm: '14px' },
              touchAction: 'manipulation'
            }
          }}>
            <InputLabel>优先级</InputLabel>
            <Select
              value={priority}
              label="优先级"
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIORITY_LEVELS.map((level) => (
                <MenuItem
                  key={level.value}
                  value={level.value}
                  sx={{
                    fontSize: { xs: '16px', sm: 'inherit' },
                    padding: { xs: '10px 14px', sm: '6px 16px' }
                  }}
                >
                  <Chip
                    size="small"
                    label={level.label}
                    sx={{
                      bgcolor: level.color,
                      color: 'white',
                      fontSize: { xs: '14px', sm: 'inherit' }
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="添加标签"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(e);
              }
            }}
          />
        </Stack>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, py: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Stack>
    </Box>
  );
}

export default TodoForm;