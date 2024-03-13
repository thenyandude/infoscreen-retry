import React, { useState, useEffect } from 'react';

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
            if (response.ok) {
                setUsers(users.map(user => user._id === userId ? { ...user, isApproved: !currentApprovalStatus } : user));
            }
        })
        .catch(error => console.error('Error:', error));
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
            if (response.ok) {
                setUsers(users.map(user => {
                    if (user._id === userId) {
                        return { ...user, role: newRole };
                    }
                    return user;
                }));
            }
        })
        .catch(error => console.error('Error updating admin status:', error));
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

    const getButtonLabel = (user) => {
        if (user.role === 'admin') {
            return 'Demote Admin';
        } else {
            return 'Toggle Admin';
        }
    };
    
    return (
        <div>
            {users.map(user => (
                <div key={user._id}>
                    {user.username} - Approved: {user.isApproved ? 'Yes' : 'No'} - Role: {user.role}
                    <button onClick={() => toggleApproval(user._id, user.isApproved)}>
                    {user.isApproved ? 'Unapprove' : 'Approve'}
                </button>         

                <button onClick={() => toggleAdmin(user._id, user.role)}>
                {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                </button>

                    <button onClick={() => deleteUser(user._id)}>Delete User</button>
                </div>
            ))}
        </div>
    );
};

export default AdminPanel;
