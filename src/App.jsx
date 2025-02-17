import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Box,
  Divider,
  Button,
  Stack,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
} from '@mui/material'
import Pomodoro from './components/Pomodoro'
import Analytics from './components/Analytics'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import ThemeSettings from './components/ThemeSettings'
import { FileUpload as FileUploadIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material'

/**
 * App组件 - Todo List应用的主要组件
 * @param {Object} props
 * @param {boolean} props.darkMode - 当前主题模式（暗色/亮色）
 * @param {Function} props.onToggleDarkMode - 切换主题模式的回调函数
 * @param {string} props.primaryColor - 主题主要颜色
 * @param {string} props.secondaryColor - 主题次要颜色
 * @param {Function} props.onPrimaryColorChange - 更改主题主要颜色的回调函数
 * @param {Function} props.onSecondaryColorChange - 更改主题次要颜色的回调函数
 */
function App({
  darkMode,
  onToggleDarkMode,
  primaryColor,
  secondaryColor,
  onPrimaryColorChange,
  onSecondaryColorChange,
}) {
  // 从localStorage加载待办事项列表，如果没有则使用空数组
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos')
    return savedTodos ? JSON.parse(savedTodos) : []
  })

  // 从localStorage加载已归档的待办事项
  const [archivedTodos, setArchivedTodos] = useState(() => {
    const savedArchivedTodos = localStorage.getItem('archivedTodos')
    return savedArchivedTodos ? JSON.parse(savedArchivedTodos) : []
  })

  // 当前选中的标签页索引
  const [currentTab, setCurrentTab] = useState(0)
  // 任务标签筛选
  const [filterTag, setFilterTag] = useState('')
  // 任务优先级筛选
  const [filterPriority, setFilterPriority] = useState('')

  // 当待办事项列表发生变化时，保存到localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // 当已归档待办事项发生变化时，保存到localStorage
  useEffect(() => {
    localStorage.setItem('archivedTodos', JSON.stringify(archivedTodos))
  }, [archivedTodos])

  /**
   * 归档已完成的待办事项
   * 将已完成的任务从待办列表移动到归档列表
   */
  const handleArchiveTodos = () => {
    const completedTodos = todos.filter(todo => todo.completed)
    setArchivedTodos([...archivedTodos, ...completedTodos])
    setTodos(todos.filter(todo => !todo.completed))
  }

  /**
   * 添加新的待办事项
   * @param {Object} todoData - 新待办事项的数据
   */
  const handleAddTodo = (todoData) => {
    setTodos([...todos, { 
      id: Date.now(), 
      ...todoData,
      completed: false, 
      completedPomodoros: 0,
      startTime: null,
      completionTime: null,
      totalWorkTime: 0
    }])
  }

  /**
   * 切换待办事项的完成状态
   * @param {number} id - 待办事项的唯一标识
   */
  const handleToggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { 
          ...todo, 
          completed: !todo.completed,
          completionTime: !todo.completed ? new Date().toISOString() : null
        } : todo
      )
    )
  }

  /**
   * 删除指定的待办事项
   * @param {number} id - 待办事项的唯一标识
   */
  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  /**
   * 导出待办事项数据
   * 将当前待办事项列表导出为JSON文件
   */
  const handleExportData = () => {
    const data = {
      todos,
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todo-list-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.todos) {
            setTodos(data.todos)
          }
        } catch (error) {
          alert('导入失败：文件格式不正确')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getAllTags = () => {
    const tagSet = new Set()
    todos.forEach(todo => {
      todo.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }

  const filteredAndSortedTodos = todos
    .filter(todo => {
      if (filterTag && (!todo.tags || !todo.tags.includes(filterTag))) {
        return false
      }
      if (filterPriority && todo.priority !== filterPriority) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">Todo List</Typography>
          <ThemeSettings
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onPrimaryColorChange={onPrimaryColorChange}
            onSecondaryColorChange={onSecondaryColorChange}
          />
        </Toolbar>
      </AppBar>
    <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#fff' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 3,
            fontSize: { xs: '1.75rem', sm: '2.125rem' }
          }}
        >
          待办事项清单
        </Typography>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            mb: 2,
            fontWeight: 'medium',
          }}
        >
          <Tab label="任务列表" />
          <Tab label="统计分析" />
          <Tab label="归档任务" />
        </Tabs>
        {currentTab === 0 ? (
          <>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportData}
              >
                导出数据
              </Button>
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUploadIcon />}
              >
                导入数据
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleImportData}
                />
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleArchiveTodos}
              >
                归档已完成任务
              </Button>
            </Stack>
            <Divider sx={{ my: 2 }} />

            <TodoForm onSubmit={handleAddTodo} />

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mb: 2 }}
            >
              <FormControl fullWidth>
                <InputLabel>筛选标签</InputLabel>
                <Select
                  value={filterTag}
                  label="筛选标签"
                  onChange={(e) => setFilterTag(e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  {getAllTags().map(tag => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>优先级</InputLabel>
                <Select
                  value={filterPriority}
                  label="优先级"
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  <MenuItem value="high">高</MenuItem>
                  <MenuItem value="medium">中</MenuItem>
                  <MenuItem value="low">低</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TodoList
              todos={filteredAndSortedTodos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />

            <Pomodoro todos={todos} setTodos={setTodos} />
          </>
        ) : currentTab === 1 ? (
          <Analytics todos={[...todos, ...archivedTodos]} />
        ) : currentTab === 2 ? (
          <TodoList
            todos={archivedTodos}
            onToggle={() => {}}
            onDelete={() => {}}
          />
        ) : null}
      </Paper>
    </Container>
  </Box>
)
}

export default App