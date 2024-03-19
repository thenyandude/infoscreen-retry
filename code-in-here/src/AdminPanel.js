import React, { useState, useEffect } from 'react';

import './AdminPanel.css'

const AdminPanel = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
      // Fetch users - adjust the endpoint as per your API
      fetch('http://localhost:3001/api/users')
        .then(response => response.json())
        .then(data => setUsers(data))
        .catch(error => console.error('Error fetching users:', error));
    }, []);

    const toggleApproval = (userId, currentApprovalStatus) => {
        fetch(`http://localhost:3001/api/toggle-approval/${userId}`, { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isApproved: !currentApprovalStatus })
        })
        .then(response => {
            console.log(`Response for approval toggle: ${response.status}`);
            if (response.ok) {
                const currentUserId = localStorage.getItem('userId');
                console.log(`Current user ID: ${currentUserId}, Updated user ID: ${userId}`);
                if (currentUserId === userId.toString()) {
                    localStorage.setItem('isApproved', !currentApprovalStatus);
                    console.log('Local storage updated for approval.');
                    alert('Your approval status has been updated. Please log in again.');
                }
            } else {
                console.error('Failed to toggle approval.');
            }
        })
        .catch(error => {
            console.error('Error updating approval status:', error);
        });
    };


    const toggleAdmin = (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        fetch(`http://localhost:3001/api/toggleAdmin/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newRole })
        })
        .then(response => {
            console.log(`Response for admin toggle: ${response.status}`);
            if (response.ok) {
                // ... update local state ...
                const currentUserId = localStorage.getItem('userId');
                console.log(`Current user ID: ${currentUserId}, Updated user ID: ${userId}`);
                if (currentUserId === userId.toString()) {
                    const newRole = currentRole === 'admin' ? 'user' : 'admin';
                    localStorage.setItem('userRole', newRole);
                    console.log('Local storage updated for admin role.');
                    alert('Your role has been updated. Please log in again.');
                }
            } else {
                console.error('Failed to toggle admin role.');
            }
        })
        .catch(error => {
            console.error('Error updating admin role:', error);
        });
    };

    
    

    const deleteUser = (userId) => {
        fetch(`http://localhost:3001/api/delete-user/${userId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    setUsers(users.filter(user => user._id !== userId));
                }
            })
            .catch(error => console.error('Error:', error));
    };

    
    return (
            <div className="admin-panel">
                {users.map(user => (
        <div key={user._id} className="admin-user">
        <div>{user.username} - Approved: {user.isApproved ? 'Yes' : 'No'} - Role: {user.role}</div>
            <button 
                onClick={() => toggleApproval(user._id, user.isApproved)}
                className={user.isApproved ? 'button-red' : 'button-green'}>
                {user.isApproved ? 'Unapprove' : 'Approve'}
            </button>
            <button 
                onClick={() => toggleAdmin(user._id, user.role)}
                className={user.role === 'admin' ? 'button-red' : 'button-green'}>
                {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
            </button>

                    <button onClick={() => deleteUser(user._id)}>Delete User</button>
                </div>
            ))}
        </div>
    );
};    

export default AdminPanel;
