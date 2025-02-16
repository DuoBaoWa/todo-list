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

const Pomodoro = ({ todos, setTodos }) => {
  const [selectedTask, setSelectedTask] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work');
  const [isForward, setIsForward] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [openSettings, setOpenSettings] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const workerRef = useRef(null);
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

  const playNotificationSound = async () => {
    const audio = new Audio('/notification.mp3');
    try {
      await audio.play();
    } catch (error) {
      console.error('播放提示音失败:', error);
      // 如果播放失败，尝试使用备用声音
      try {
        const fallbackAudio = new Audio('/beep.mp3');
        await fallbackAudio.play();
      } catch (fallbackError) {
        console.error('备用提示音也播放失败:', fallbackError);
      }
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
    playNotificationSound();
    showNotification();
    if (mode === 'work' && selectedTask) {
      triggerConfetti();
      setTodos(prevTodos => {
        return prevTodos.map(todo => {
          if (todo.id === selectedTask) {
            const newCompletedPomodoros = todo.completedPomodoros + 1;
            const isCompleted = newCompletedPomodoros >= todo.pomodoroCount;
            const workTimeInMinutes = workTime;
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
      setMode('break');
      setTimeLeft(breakTime * 60);
    } else {
      setMode('work');
      setTimeLeft(workTime * 60);
    }
    setIsRunning(false);
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
          <DialogTitle>时间设置</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="工作时长（分钟）"
              type="number"
              fullWidth
              value={workTime}
              onChange={(e) => setWorkTime(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <TextField
              margin="dense"
              label="休息时长（分钟）"
              type="number"
              fullWidth
              value={breakTime}
              onChange={(e) => setBreakTime(Math.max(1, parseInt(e.target.value) || 1))}
            />
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