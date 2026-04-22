import fetch from 'node-fetch';

const coordinatorToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyZjRkY2ZlLTNiOGItNDgzOC05YzEwLTlkYjEwOTlhNmM3MyIsImVtYWlsIjoiUGF0aWwwMUBnbWFpbC5jb20iLCJyb2xlIjoiY29vcmRpbmF0b3IiLCJkZXBhcnRtZW50IjoiQ29tcHV0ZXIgRW5naW5lZXJpbmciLCJpc19hcHByb3ZlZCI6dHJ1ZSwiaXNfZmlyc3RfbG9naW4iOmZhbHNlLCJzdGF0dXMiOiJpbmFjdGl2ZSIsImlhdCI6MTc0NDYxNDA1MiwiZXhwIjoxNzQ0NjE3NjUyfQ.7Lq7w-yJhCJ-rqQJvXO4rJ1nXl9gYvT8kCf2YhNqG3M';

async function testNotifications() {
  try {
    console.log('🧪 Testing coordinator notifications API...');
    
    const response = await fetch('http://localhost:5000/api/coordinators/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${coordinatorToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Notifications response:', data);
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testNotifications();
