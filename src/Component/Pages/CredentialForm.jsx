import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
function CredentialForm({
  showAdminModal: externalShowAdmin = false,
  showUserModal: externalShowUser = false,
  onCloseAdmin: externalCloseAdmin = () => { },
  onCloseUser: externalCloseUser = () => { }
}) {
  const [internalShowAdmin, setInternalShowAdmin] = useState(false);
  const [internalShowUser, setInternalShowUser] = useState(false);

  const isControlled = externalShowAdmin !== undefined || externalShowUser !== undefined;
  const showAdminModal = isControlled ? externalShowAdmin : internalShowAdmin;
  const showUserModal = isControlled ? externalShowUser : internalShowUser;

  const [adminData, setAdminData] = useState({
    username: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });

  const [userData, setUserData] = useState({
    cashierName: '',
    cashierId: '',
    counterNum: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });

  const togglePasswordVisibility = (field, isAdmin) => {
    if (isAdmin) {
      setAdminData(prev => ({ ...prev, [field]: !prev[field] }));
    } else {
      setUserData(prev => ({ ...prev, [field]: !prev[field] }));
    }
  };


  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (adminData.password !== adminData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
   const response = await axios.post("http://localhost:5000/api/credentials/admin", adminData);

      alert(response.data.message);
      resetAdminForm();
      handleCloseAdmin();
      console.log(response.data)
    } catch (error) {
      alert(error.response?.data?.message || "Error saving admin");
      console.log(error)
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/credentials/users", userData);
      alert(response.data.message);
      console.log(response.data);
      resetUserForm();
      handleCloseUser();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving user");
        console.log(error)
    }
  };



  const resetAdminForm = () => {
    setAdminData({
      username: '',
      contactNumber: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false
    });
  };

  const resetUserForm = () => {
    setUserData({
      cashierName: '',
      cashierId: '',
      counterNum: '',
      contactNumber: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false
    });
  };

  const handleCloseAdmin = () => {
    isControlled ? externalCloseAdmin() : setInternalShowAdmin(false);
  };

  const handleCloseUser = () => {
    isControlled ? externalCloseUser() : setInternalShowUser(false);
  };

  return (
    <div>
      {!isControlled && (
        <div className="flex gap-4 mt-6 justify-center">
          <button
            type="button"
            onClick={() => setInternalShowAdmin(true)}
            className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 shadow-md transition"
          >
            Admin Credentials
          </button>
          <button
            type="button"
            onClick={() => setInternalShowUser(true)}
            className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 shadow-md transition"
          >
            User Credentials
          </button>
        </div>
      )}

      {(showAdminModal || showUserModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 animate-fade-in">
            {showAdminModal && (
              <>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</h2>
                <form onSubmit={handleAdminSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'adminUsername', label: 'Username', type: 'text', value: adminData.username, onChange: e => setAdminData({ ...adminData, username: e.target.value }) },
                    { id: 'adminContact', label: 'Contact Number', type: 'tel', value: adminData.contactNumber, onChange: e => setAdminData({ ...adminData, contactNumber: e.target.value }) },
                  ].map(({ id, label, type, value, onChange }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-gray-600 mb-1">{label}</label>
                      <input
                        type={type}
                        id={id}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={value}
                        onChange={onChange}
                        required
                      />
                    </div>
                  ))}

                  {[
                    { id: 'adminPassword', label: 'Password', field: 'showPassword', value: adminData.password },
                    { id: 'adminConfirmPassword', label: 'Confirm Password', field: 'showConfirmPassword', value: adminData.confirmPassword },
                  ].map(({ id, label, field, value }) => (
                    <div key={id} className="relative">
                      <label htmlFor={id} className="block text-gray-600 mb-1">{label}</label>
                      <input
                        type={adminData[field] ? 'text' : 'password'}
                        id={id}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500"
                        value={value}
                        onChange={(e) => setAdminData({ ...adminData, [id.includes('Confirm') ? 'confirmPassword' : 'password']: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 top-7 flex items-center"
                        onClick={() => togglePasswordVisibility(field, true)}
                      >
                        {adminData[field] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  ))}
                </form>
                <div className="flex justify-end mt-6 gap-4">
                  <button
                    onClick={handleCloseAdmin}
                    className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdminSubmit}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </>
            )}

            {showUserModal && (
              <>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">User Login</h2>
                <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'cashierName', label: 'Cashier Name', type: 'text', value: userData.cashierName },
                    { id: 'cashierId', label: 'Cashier ID', type: 'number', value: userData.cashierId },
                    { id: 'counterNum', label: 'Counter Number', type: 'text', value: userData.counterNum },
                    { id: 'contactNumber', label: 'Contact Number', type: 'tel', value: userData.contactNumber },
                  ].map(({ id, label, type, value }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-gray-600 mb-1">{label}</label>
                      <input
                        type={type}
                        id={id}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={value}
                        onChange={(e) => setUserData({ ...userData, [id]: e.target.value })}
                        required
                      />
                    </div>
                  ))}

                  {[
                    { id: 'userPassword', label: 'Password', field: 'showPassword', value: userData.password },
                    { id: 'userConfirmPassword', label: 'Confirm Password', field: 'showConfirmPassword', value: userData.confirmPassword },
                  ].map(({ id, label, field, value }) => (
                    <div key={id} className="relative">
                      <label htmlFor={id} className="block text-gray-600 mb-1">{label}</label>
                      <input
                        type={userData[field] ? 'text' : 'password'}
                        id={id}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500"
                        value={value}
                        onChange={(e) => setUserData({ ...userData, [id.includes('Confirm') ? 'confirmPassword' : 'password']: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 top-7 flex items-center"
                        onClick={() => togglePasswordVisibility(field, false)}
                      >
                        {userData[field] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  ))}
                </form>
                <div className="flex justify-end mt-6 gap-4">
                  <button
                    onClick={handleCloseUser}
                    className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUserSubmit}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default CredentialForm;