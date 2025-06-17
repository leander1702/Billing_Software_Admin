import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiSave, FiX, FiUser, FiBriefcase, FiCreditCard } from "react-icons/fi";

const UserManagement = () => {
  const [latestCompany, setLatestCompany] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({
    company: false,
    admin: false,
    users: {}
  });
  const [formData, setFormData] = useState({
    company: {},
    admin: {},
    users: {}
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [companyRes, adminRes, userRes] = await Promise.all([
          axios.get("http://localhost:5000/api/companies"),
          axios.get("http://localhost:5000/api/credentials/admin"),
          axios.get("http://localhost:5000/api/credentials/users")
        ]);

        const sortedCompanies = companyRes.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setLatestCompany(sortedCompanies[0] || null);
        setFormData(prev => ({ ...prev, company: sortedCompanies[0] || {} }));

        setAdmin(adminRes.data);
        setFormData(prev => ({ ...prev, admin: adminRes.data || {} }));

        const usersData = userRes.data || [];
        setUsers(usersData);
        setFormData(prev => ({
          ...prev,
          users: usersData.reduce((acc, user) => ({ ...acc, [user._id]: user }), {})
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleEdit = (type, id = null) => {
    if (type === 'company') {
      setEditing({ ...editing, company: true });
    } else if (type === 'admin') {
      setEditing({ ...editing, admin: true });
    } else {
      setEditing({ ...editing, users: { ...editing.users, [id]: true } });
    }
  };

  const handleCancel = (type, id = null) => {
    if (type === 'company') {
      setEditing({ ...editing, company: false });
      setFormData(prev => ({ ...prev, company: latestCompany || {} }));
    } else if (type === 'admin') {
      setEditing({ ...editing, admin: false });
      setFormData(prev => ({ ...prev, admin: admin || {} }));
    } else {
      setEditing({ ...editing, users: { ...editing.users, [id]: false } });
      setFormData(prev => ({
        ...prev,
        users: { ...prev.users, [id]: users.find(u => u._id === id) || {} }
      }));
    }
  };

  const handleChange = (e, type, id = null) => {
    const { name, value } = e.target;
    if (type === 'company') {
      setFormData(prev => ({
        ...prev,
        company: { ...prev.company, [name]: value }
      }));
    } else if (type === 'admin') {
      setFormData(prev => ({
        ...prev,
        admin: { ...prev.admin, [name]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        users: {
          ...prev.users,
          [id]: { ...prev.users[id], [name]: value }
        }
      }));
    }
  };

  const handleSave = async (type, id = null) => {
    try {
      if (type === 'company') {
        await axios.put(`http://localhost:5000/api/companies/${latestCompany._id}`, formData.company);
        setLatestCompany(formData.company);
        setEditing({ ...editing, company: false });
      } else if (type === 'admin') {
        await axios.put(`http://localhost:5000/api/credentials/admin/${admin._id}`, formData.admin);
        setAdmin(formData.admin);
        setEditing({ ...editing, admin: false });
      } else {
        await axios.put(`http://localhost:5000/api/credentials/users/${id}`, formData.users[id]);
        setUsers(users.map(u => u._id === id ? formData.users[id] : u));
        setEditing({ ...editing, users: { ...editing.users, [id]: false } });
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/credentials/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Company Info Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r  p-4 text-black flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FiBriefcase className="text-xl" />
            <h2 className="text-xl font-bold">Company Information</h2>
          </div>
          {editing.company ? (
            <div className="flex space-x-2">
              <button
                onClick={() => handleSave('company')}
                className="p-1 bg-white text-blue-600 rounded-md hover:bg-blue-50"
              >
                <FiSave className="text-lg" />
              </button>
              <button
                onClick={() => handleCancel('company')}
                className="p-1 bg-white text-red-600 rounded-md hover:bg-red-50"
              >
                <FiX className="text-lg" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEdit('company')}
              className="p-1 bg-white text-blue-600 rounded-md hover:bg-blue-50"
            >
              <FiEdit className="text-lg" />
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {latestCompany ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Business Name</label>
                  {editing.company ? (
                    <input
                      type="text"
                      name="businessName"
                      value={formData.company.businessName || ''}
                      onChange={(e) => handleChange(e, 'company')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold">{latestCompany.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  {editing.company ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.company.email || ''}
                      onChange={(e) => handleChange(e, 'company')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">{latestCompany.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">GSTIN</label>
                  {editing.company ? (
                    <input
                      type="text"
                      name="gstin"
                      value={formData.company.gstin || ''}
                      onChange={(e) => handleChange(e, 'company')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">{latestCompany.gstin}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  {editing.company ? (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.company.phoneNumber || ''}
                      onChange={(e) => handleChange(e, 'company')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">{latestCompany.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  {editing.company ? (
                    <textarea
                      name="address"
                      value={formData.company.address || ''}
                      onChange={(e) => handleChange(e, 'company')}
                      rows="2"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">
                      {latestCompany.address}, {latestCompany.state} - {latestCompany.pincode}
                    </p>
                  )}
                </div>

                {latestCompany.logoUrl && (
                  <div className="flex items-center space-x-4">
                    <label className="block text-sm font-medium text-gray-500">Logo</label>
                    <img
                      src={`http://localhost:5000${latestCompany.logoUrl}`}
                      alt="Logo"
                      className="w-16 h-16 object-contain rounded-md border"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">No company information available</p>
          )}
        </div>
      </div>

      {/* Admin Info Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r p-4 text-black flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FiUser className="text-xl" />
            <h2 className="text-xl font-bold">Admin Credentials</h2>
          </div>
          {editing.admin ? (
            <div className="flex space-x-2">
              <button
                onClick={() => handleSave('admin')}
                className="p-1 bg-white text-purple-600 rounded-md hover:bg-purple-50"
              >
                <FiSave className="text-lg" />
              </button>
              <button
                onClick={() => handleCancel('admin')}
                className="p-1 bg-white text-red-600 rounded-md hover:bg-red-50"
              >
                <FiX className="text-lg" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEdit('admin')}
              className="p-1 bg-white text-purple-600 rounded-md hover:bg-purple-50"
            >
              <FiEdit className="text-lg" />
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {admin ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-500">Username</label>
                {editing.admin ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.admin.username || ''}
                    onChange={(e) => handleChange(e, 'admin')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-700">{admin.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Contact Number</label>
                {editing.admin ? (
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.admin.contactNumber || ''}
                    onChange={(e) => handleChange(e, 'admin')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-700">{admin.contactNumber}</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">No admin credentials available</p>
          )}
        </div>
      </div>

      {/* Cashier Users Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r  p-4 text-black flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FiCreditCard className="text-xl" />
            <h2 className="text-xl font-bold">Cashier Users</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row justify-between items-center gap-6"
                >
                  {/* Left: User details */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 w-full">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{user.cashierName}</h3>
                      <p className="text-sm text-gray-500">ID: {user.cashierId}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500">Counter Number</label>
                      {editing.users[user._id] ? (
                        <input
                          type="text"
                          name="counterNum"
                          value={formData.users[user._id]?.counterNum || ''}
                          onChange={(e) => handleChange(e, 'user', user._id)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">{user.counterNum}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500">Contact Number</label>
                      {editing.users[user._id] ? (
                        <input
                          type="text"
                          name="contactNumber"
                          value={formData.users[user._id]?.contactNumber || ''}
                          onChange={(e) => handleChange(e, 'user', user._id)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">{user.contactNumber}</p>
                      )}
                    </div>
                     {/* Right: Action buttons */}
                  <div className="flex gap-2 mt-4 lg:mt-0">
                    {editing.users[user._id] ? (
                      <>
                        <button
                          onClick={() => handleSave('user', user._id)}
                          className="p-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                        >
                          <FiSave className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleCancel('user', user._id)}
                          className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          <FiX className="text-lg" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit('user', user._id)}
                          className="p-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </>
                    )}
                  </div>
                  </div>

                 
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No cashier users found</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserManagement;