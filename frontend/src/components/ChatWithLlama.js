import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';

function ChatWithLlama({ analysis }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, analysis }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: 'llama', text: data.response }]);
    } catch (e) {
      setMessages(msgs => [...msgs, { sender: 'llama', text: 'Error: Could not get response.' }]);
    }
    setInput('');
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6" gutterBottom>Chat with LLaMA 3.2 about your dataset</Typography>
      <List sx={{ minHeight: 120, maxHeight: 300, overflow: 'auto', mb: 2 }}>
        {messages.map((msg, idx) => (
          <ListItem key={idx} alignItems={msg.sender === 'user' ? 'right' : 'left'}>
            <ListItemText
              primary={msg.text}
              secondary={msg.sender === 'user' ? 'You' : 'LLaMA'}
              sx={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}
            />
          </ListItem>
        ))}
        {loading && (
          <ListItem>
            <CircularProgress size={20} />
          </ListItem>
        )}
      </List>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask something about your dataset..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          disabled={loading}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
}

export default ChatWithLlama; 