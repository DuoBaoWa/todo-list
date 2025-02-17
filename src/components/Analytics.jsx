import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Grid, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import * as echarts from 'echarts';

/**
 * Analytics组件 - 任务数据统计和可视化
 * @param {Object} props
 * @param {Array} props.todos - 待办事项列表，包括当前和已归档的任务
 */
const Analytics = ({ todos }) => {
  // 图表DOM引用
  const taskCompletionChartRef = useRef(null);
  const pomodoroChartRef = useRef(null);
  const workTimeChartRef = useRef(null);
  const trendChartRef = useRef(null);

  // 数据筛选状态
  const [timeRange, setTimeRange] = useState('week');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  /**
   * 处理时间范围变更
   * @param {Event} event - 事件对象
   * @param {string} newTimeRange - 新的时间范围值
   */
  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  /**
   * 处理标签筛选变更
   * @param {Event} event - 事件对象
   */
  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  /**
   * 处理优先级筛选变更
   * @param {Event} event - 事件对象
   */
  const handlePriorityChange = (event) => {
    setSelectedPriority(event.target.value);
  };

  /**
   * 根据标签和优先级筛选任务
   * @param {Array} todoList - 待过滤的任务列表
   * @returns {Array} 过滤后的任务列表
   */
  const filterTodos = (todoList) => {
    return todoList.filter(todo => {
      const tagMatch = selectedTag === 'all' || (!todo.tags && selectedTag === '') || (todo.tags && todo.tags.includes(selectedTag));
      const priorityMatch = selectedPriority === 'all' || todo.priority === selectedPriority;
      return tagMatch && priorityMatch;
    });
  };

  /**
   * 获取指定时间范围的数据
   * @param {string} range - 时间范围（week/month/year）
   * @returns {Array} 按日期组织的数据数组
   */
  const getTimeRangeData = (range) => {
    const now = new Date();
    const data = [];
    let days = 7;
    let format = 'MM-DD';
    
    if (range === 'month') {
      days = 30;
    } else if (range === 'year') {
      days = 365;
      format = 'YYYY-MM';
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = range === 'year' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const dayTodos = filterTodos(todos.filter(todo => {
        const todoDate = new Date(todo.completionTime || todo.startTime || Date.now());
        return range === 'year'
          ? todoDate.getFullYear() === date.getFullYear() && todoDate.getMonth() === date.getMonth()
          : todoDate.getFullYear() === date.getFullYear() && 
            todoDate.getMonth() === date.getMonth() && 
            todoDate.getDate() === date.getDate();
      }));

      data.push({
        date: dateStr,
        completed: dayTodos.filter(todo => todo.completed).length,
        workTime: dayTodos.reduce((acc, todo) => acc + todo.totalWorkTime, 0)
      });
    }

    return data;
  };

  useEffect(() => {
    const filteredTodos = filterTodos(todos);

    // 任务完成情况统计
    const taskChart = echarts.init(taskCompletionChartRef.current);
    const completedTasks = filteredTodos.filter(todo => todo.completed).length;
    const pendingTasks = filteredTodos.length - completedTasks;

    taskChart.setOption({
      title: { text: '任务完成情况' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '70%',
        data: [
          { value: completedTasks, name: '已完成' },
          { value: pendingTasks, name: '待完成' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    });

    // 番茄钟使用统计
    const pomodoroChart = echarts.init(pomodoroChartRef.current);
    const totalPomodoros = filteredTodos.filter(todo => todo.completed).reduce((acc, todo) => acc + todo.pomodoroCount, 0);
    const completedPomodoros = filteredTodos.filter(todo => todo.completed).reduce((acc, todo) => acc + todo.completedPomodoros, 0);

    pomodoroChart.setOption({
      title: { text: '番茄钟使用情况' },
      tooltip: { 
        trigger: 'axis',
        formatter: '{b}: {c}个'
      },
      xAxis: { 
        type: 'category', 
        data: ['计划', '已完成'],
        axisLabel: { interval: 0 }
      },
      yAxis: { 
        type: 'value',
        minInterval: 1,
        axisLabel: { formatter: '{value}个' }
      },
      series: [{
        type: 'bar',
        data: [
          { value: totalPomodoros, itemStyle: { color: '#91cc75' } },
          { value: completedPomodoros, itemStyle: { color: '#5470c6' } }
        ],
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}个'
        }
      }]
    });

    // 工作时长分析
    const workTimeChart = echarts.init(workTimeChartRef.current);
    const workTimeData = filteredTodos
      .filter(todo => todo.totalWorkTime > 0)
      .map(todo => ({
        name: todo.text,
        value: todo.totalWorkTime
      }));

    workTimeChart.setOption({
      title: { text: '任务工作时长（分钟）' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: workTimeData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    });

    // 趋势分析图表
    const trendChart = echarts.init(trendChartRef.current);
    const trendData = getTimeRangeData(timeRange);

    trendChart.setOption({
      title: { text: '任务完成和工作时长趋势' },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: { data: ['完成任务数', '工作时长（分钟）'] },
      xAxis: {
        type: 'category',
        data: trendData.map(item => item.date),
        axisLabel: { rotate: timeRange === 'week' ? 0 : 45 }
      },
      yAxis: [
        {
          type: 'value',
          name: '完成任务数',
          position: 'left'
        },
        {
          type: 'value',
          name: '工作时长',
          position: 'right'
        }
      ],
      series: [
        {
          name: '完成任务数',
          type: 'line',
          data: trendData.map(item => item.completed),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#5470c6' }
        },
        {
          name: '工作时长（分钟）',
          type: 'line',
          yAxisIndex: 1,
          data: trendData.map(item => item.workTime),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#91cc75' }
        }
      ]
    });

    return () => {
      taskChart.dispose();
      pomodoroChart.dispose();
      workTimeChart.dispose();
      trendChart.dispose();
    };
  }, [todos, timeRange, selectedTag, selectedPriority]);

  // 获取所有唯一的标签
  const uniqueTags = ['all', '', ...new Set(todos.flatMap(todo => todo.tags || []))].filter(tag => tag !== undefined);
  // 获取所有唯一的优先级
  const priorities = ['all', 'high', 'medium', 'low'];

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          统计分析
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>标签筛选</InputLabel>
            <Select
              value={selectedTag}
              label="标签筛选"
              onChange={handleTagChange}
            >
              {uniqueTags.map(tag => (
                <MenuItem key={tag} value={tag}>
                  {tag === 'all' ? '全部' : tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>优先级筛选</InputLabel>
            <Select
              value={selectedPriority}
              label="优先级筛选"
              onChange={handlePriorityChange}
            >
              {priorities.map(priority => (
                <MenuItem key={priority} value={priority}>
                  {priority === 'all' ? '全部' : 
                   priority === 'high' ? '高' :
                   priority === 'medium' ? '中' : '低'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <div ref={taskCompletionChartRef} style={{ height: '300px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <div ref={pomodoroChartRef} style={{ height: '300px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <div ref={workTimeChartRef} style={{ height: '300px' }} />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={timeRange}
                exclusive
                onChange={handleTimeRangeChange}
                aria-label="时间范围"
              >
                <ToggleButton value="week" aria-label="一周">
                  一周
                </ToggleButton>
                <ToggleButton value="month" aria-label="一月">
                  一月
                </ToggleButton>
                <ToggleButton value="year" aria-label="一年">
                  一年
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <div ref={trendChartRef} style={{ height: '400px' }} />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Analytics;