import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Chip,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const PRIORITY_COLORS = {
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
};

const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
};

function TodoList({ todos, onToggle, onDelete }) {
  const [filter, setFilter] = React.useState('active');

  const filteredTodos = React.useMemo(() => {
    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'active':
        return todos.filter(todo => !todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
        <InputLabel>显示任务</InputLabel>
        <Select
          value={filter}
          label="显示任务"
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="all">全部任务</MenuItem>
          <MenuItem value="active">未完成任务</MenuItem>
          <MenuItem value="completed">已完成任务</MenuItem>
        </Select>
      </FormControl>
      <List>
        {filteredTodos.map((todo) => (
          <ListItem
            key={todo.id}
            dense
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#fff',
              mb: 1.5,
              borderRadius: 2,
              boxShadow: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
                transform: 'translateY(-2px)',
                boxShadow: 2
              },
              p: { xs: 1, sm: 1.5 }
            }}
          >
            <Checkbox
              edge="start"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
            />
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography
                    component="span"
                    sx={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? 'text.disabled' : 'text.primary',
                    }}
                  >
                    {todo.text}
                  </Typography>
                  <Chip
                    size="small"
                    label={PRIORITY_LABELS[todo.priority]}
                    sx={{
                      bgcolor: PRIORITY_COLORS[todo.priority],
                      color: 'white',
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1.5, ml: 1 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    番茄钟进度: {todo.completedPomodoros}/{todo.pomodoroCount}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {todo.tags?.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => onDelete(todo.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default TodoList;