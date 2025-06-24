import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const AddUsers: React.FC = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    // Fetch roles from API
    fetch('/mock/responses/admin-roles.json')
      .then(res => res.json())
      .then(data => {
        // Fix: Extract role names from objects
        if (Array.isArray(data.roles)) {
          setRoles(data.roles.map((role: any) => role.name));
        } else if (Array.isArray(data)) {
          setRoles(data.map((role: any) => role.name));
        }
      });
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({ firstName: '', lastName: '', email: '', role: '' }); // Reset form fields
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <Card className="w-full max-w-6xl mx-auto rounded-xl shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-blue-700">Add Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Add New User</h2>
              <p className="text-gray-500">Create new user accounts and assign roles</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form className="space-y-4" onSubmit={handleAddUser}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          placeholder="John" 
                          required
                          value={form.firstName}
                          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          placeholder="Doe" 
                          required
                          value={form.lastName}
                          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="john.doe@company.com" 
                        required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required
                        value={form.role}
                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end w-full mt-4">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg shadow hover:scale-105 transition-transform font-semibold text-lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                        ) : null}
                        {loading ? 'Adding User...' : 'Add User'}
                      </button>
                    </div>
                  </form>
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4 }}
                        className="mt-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-center shadow"
                      >
                        <div className="text-3xl mb-2">✅</div>
                        <div className="font-semibold mb-1">User Created!</div>
                        <div>An email has been sent to the user with instructions to set up their account.</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};