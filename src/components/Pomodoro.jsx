import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import confetti from 'canvas-confetti';
import { PlayArrow, Pause, Stop, VolumeUp, Settings } from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';

/**
 * Pomodoro组件 - 番茄工作法计时器
 * @param {Object} props
 * @param {Array} props.todos - 待办事项列表
 * @param {Function} props.setTodos - 更新待办事项的函数
 */
const Pomodoro = ({ todos, setTodos }) => {
  // 当前选中的任务ID
  const [selectedTask, setSelectedTask] = useState('');
  // 剩余时间（秒）
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  // 计时器运行状态
  const [isRunning, setIsRunning] = useState(false);
  // 当前模式（工作/休息）
  const [mode, setMode] = useState('work');
  // 计时方向（正向/倒计时）
  const [isForward, setIsForward] = useState(false);
  // 已经过时间
  const [elapsedTime, setElapsedTime] = useState(0);
  // 工作时长（分钟）
  const [workTime, setWorkTime] = useState(25);
  // 休息时长（分钟）
  const [breakTime, setBreakTime] = useState(5);
  // 设置对话框状态
  const [openSettings, setOpenSettings] = useState(false);
  // 工作提示音文件
  const [workAudioFile, setWorkAudioFile] = useState(() => {
    const savedWorkAudio = localStorage.getItem('workAudioFile');
    return savedWorkAudio || '/todo-list/notification.mp3';
  });
  // 休息提示音文件
  const [breakAudioFile, setBreakAudioFile] = useState(() => {
    const savedBreakAudio = localStorage.getItem('breakAudioFile');
    return savedBreakAudio || '/todo-list/break-notification.mp3';
  });
  // 祝贺对话框状态
  const [showCongrats, setShowCongrats] = useState(false);
  // Web Worker引用
  const workerRef = useRef(null);
  // 系统唤醒锁引用
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      if (selectedTask && !todos.find(todo => todo.id === selectedTask).startTime) {
        setTodos(prevTodos => prevTodos.map(todo =>
          todo.id === selectedTask ? { ...todo, startTime: new Date().toISOString() } : todo
        ));
      }

      // 创建Web Worker来处理计时
      const workerBlob = new Blob([
        `
        let timer;
        self.onmessage = function(e) {
          if (e.data.type === 'start') {
            clearInterval(timer);
            timer = setInterval(() => {
              self.postMessage({ type: 'tick' });
            }, 1000);
          } else if (e.data.type === 'stop') {
            clearInterval(timer);
          }
        };
        `
      ], { type: 'application/javascript' });

      workerRef.current = new Worker(URL.createObjectURL(workerBlob));
      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'tick') {
          if (isForward) {
            setElapsedTime(prev => prev + 1);
          } else if (timeLeft > 0) {
            setTimeLeft(prev => {
              if (prev <= 1) {
                handleTimerComplete();
                return 0;
              }
              return prev - 1;
            });
          }
        }
      };

      workerRef.current.postMessage({ type: 'start' });

      // 请求和管理系统唤醒锁
      const requestWakeLock = async () => {
        try {
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
        } catch (err) {
          console.log('Wake Lock error:', err);
        }
      };
      requestWakeLock();
    }

    // 清理函数
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' });
        workerRef.current.terminate();
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isRunning, timeLeft, isForward]);

  // 处理页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      } else if (!document.hidden && isRunning) {
        const requestWakeLock = async () => {
          try {
            if ('wakeLock' in navigator) {
              wakeLockRef.current = await navigator.wakeLock.request('screen');
            }
          } catch (err) {
            console.log('Wake Lock error:', err);
          }
        };
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);

  const triggerConfetti = () => {
    const end = Date.now() + 1000;

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

    (function frame() {
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 45,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 45,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const paperAnimation = useSpring({
    backgroundColor: mode === 'work' ? '#ffffff' : '#e8f5e9',
    config: { duration: 500 },
  });

  const requestNotificationPermission = async () => {
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    localStorage.setItem('workAudioFile', workAudioFile);
  }, [workAudioFile]);

  useEffect(() => {
    localStorage.setItem('breakAudioFile', breakAudioFile);
  }, [breakAudioFile]);

  const handleWorkAudioChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      setWorkAudioFile(audioUrl);
    }
  };

  const handleBreakAudioChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      setBreakAudioFile(audioUrl);
    }
  };

  const playNotificationSound = async () => {
    try {
      const audioFile = mode === 'work' ? workAudioFile : breakAudioFile;
      const audio = new Audio(audioFile);
      await audio.load();
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('播放提示音失败:', error);
        });
      }
    } catch (error) {
      console.error('加载提示音失败:', error);
    }
  };

  const showNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('番茄钟提醒', {
        body: mode === 'work' ? '工作时间结束，该休息了！' : '休息时间结束，继续工作吧！',
        icon: '/tomato.png'
      });
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'work' && selectedTask) {
      playNotificationSound(); // 工作时间结束时播放提示音
      showNotification();
      const selectedTodo = todos.find(todo => todo.id === selectedTask);
      const newCompletedPomodoros = selectedTodo.completedPomodoros + 1;
      
      setTodos(prevTodos => {
        return prevTodos.map(todo => {
          if (todo.id === selectedTask) {
            const workTimeInMinutes = workTime;
            return {
              ...todo,
              completedPomodoros: newCompletedPomodoros,
              totalWorkTime: todo.totalWorkTime + workTimeInMinutes
            };
          }
          return todo;
        });
      });

      setTimeout(() => {
        setMode('break');
        setTimeLeft(breakTime * 60);
        setIsRunning(true);
      }, 1000);
    } else if (mode === 'break' && selectedTask) {
      playNotificationSound(); // 休息时间结束时播放提示音
      showNotification();
      const selectedTodo = todos.find(todo => todo.id === selectedTask);
      if (selectedTodo) {
        const isCompleted = selectedTodo.completedPomodoros >= selectedTodo.pomodoroCount;
        if (isCompleted) {
          setTodos(prevTodos => {
            return prevTodos.map(todo => {
              if (todo.id === selectedTask) {
                return {
                  ...todo,
                  completed: true,
                  completionTime: new Date().toISOString()
                };
              }
              return todo;
            });
          });
          triggerConfetti();
        } else {
          setTimeout(() => {
            setMode('work');
            setTimeLeft(workTime * 60);
            setIsRunning(true);
          }, 1000);
        }
      }
    }
  };

  const handleSettingsOpen = () => setOpenSettings(true);
  const handleSettingsClose = () => setOpenSettings(false);

  const handleSettingsSave = () => {
    if (!isRunning) {
      if (!isForward) {
        setTimeLeft(mode === 'work' ? workTime * 60 : breakTime * 60);
      }
      handleSettingsClose();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false);
    if (isForward && selectedTask) {
      playNotificationSound();
      setTodos(prevTodos => {
        return prevTodos.map(todo => {
          if (todo.id === selectedTask) {
            const workTimeInMinutes = Math.floor(elapsedTime / 60);
            const newCompletedPomodoros = todo.completedPomodoros + 1;
            const isCompleted = newCompletedPomodoros >= todo.pomodoroCount;
            return {
              ...todo,
              completedPomodoros: newCompletedPomodoros,
              completed: isCompleted,
              totalWorkTime: todo.totalWorkTime + workTimeInMinutes,
              completionTime: isCompleted ? new Date().toISOString() : todo.completionTime
            };
          }
          return todo;
        });
      });
      triggerConfetti();
      setElapsedTime(0);
    } else {
      setTimeLeft(workTime * 60);
      setMode('work');
    }
  };

  return (
    <animated.div style={paperAnimation}>
      <Paper elevation={3} sx={{ p: 3, mt: 3, position: 'relative', overflow: 'hidden' }}>

        <Typography variant="h5" gutterBottom align="center">
          番茄工作法
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>选择任务</InputLabel>
            <Select
              value={selectedTask}
              label="选择任务"
              onChange={(e) => setSelectedTask(e.target.value)}
            >
              {todos.filter(todo => !todo.completed).map((todo) => (
                <MenuItem key={todo.id} value={todo.id}>
                  {todo.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h2" component="div" sx={{ fontFamily: 'monospace' }}>
            {isForward ? formatTime(elapsedTime) : formatTime(timeLeft)}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {isForward ? '已计时' : (mode === 'work' ? '工作时间' : '休息时间')}
          </Typography>
          {selectedTask && (
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
              {`进度: ${todos.find(todo => todo.id === selectedTask)?.completedPomodoros || 0} / ${todos.find(todo => todo.id === selectedTask)?.pomodoroCount || 0} 个番茄钟`}
            </Typography>
          )}
        </Box>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <FormControlLabel
            control={<Switch checked={isForward} onChange={(e) => {
              if (!isRunning) {
                setIsForward(e.target.checked);
                setElapsedTime(0);
                setTimeLeft(workTime * 60);
              }
            }} />}
            label={isForward ? "正向计时" : "倒计时"}
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          {!isRunning ? (
            <IconButton onClick={handleStart} color="primary" size="large">
              <PlayArrow />
            </IconButton>
          ) : (
            <IconButton onClick={handlePause} color="primary" size="large">
              <Pause />
            </IconButton>
          )}
          <IconButton onClick={handleStop} color="secondary" size="large">
            <Stop />
          </IconButton>
          <IconButton onClick={handleSettingsOpen} color="primary" size="large">
            <Settings />
          </IconButton>
        </Stack>

        <Dialog open={openSettings} onClose={handleSettingsClose}>
          <DialogTitle>设置</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="工作时长（分钟）"
              type="number"
              value={workTime}
              onChange={(e) => setWorkTime(parseInt(e.target.value))}
            />
            <TextField
              label="休息时长（分钟）"
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(parseInt(e.target.value))}
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>工作结束提示音</Typography>
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="work-audio-file"
                type="file"
                onChange={handleWorkAudioChange}
              />
              <label htmlFor="work-audio-file">
                <Button variant="outlined" component="span">
                  选择音频文件
                </Button>
              </label>
            </Box>
            <Box>
              <Typography variant="subtitle1" gutterBottom>休息结束提示音</Typography>
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="break-audio-file"
                type="file"
                onChange={handleBreakAudioChange}
              />
              <label htmlFor="break-audio-file">
                <Button variant="outlined" component="span">
                  选择音频文件
                </Button>
              </label>
            </Box>
          </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSettingsClose}>取消</Button>
            <Button onClick={handleSettingsSave}>保存</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </animated.div>
  );
};

export default Pomodoro;