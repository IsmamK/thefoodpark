
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiTrash2, FiPlus, FiPercent, FiDollarSign, FiTag } from 'react-icons/fi';

const Discount = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [newDiscount, setNewDiscount] = useState({
        name: '',
        amount: '',
        is_percentage: true,
        start_date: '',
        end_date: '',
        code: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL;     

    // Fetch discounts
    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const response = await axios.get('https://thefoodpark.xyz//api/discounts/');
                setDiscounts(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching discounts:', error);
                setLoading(false);
                Swal.fire('Error', 'Failed to load discounts', 'error');
            }
        };
        fetchDiscounts();
    }, []);

    // Delete discount
    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await axios.delete(`${apiUrl}/discounts/${id}/`);
                setDiscounts(discounts.filter(discount => discount.id !== id));
                Swal.fire('Deleted!', 'Discount has been deleted.', 'success');
            }
        } catch (error) {
            console.error('Error deleting discount:', error);
            Swal.fire('Error!', 'Failed to delete discount.', 'error');
        }
    };

    // Handle input change for modal form
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewDiscount({
            ...newDiscount,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Format dates to ISO string
            const formattedDiscount = {
                ...newDiscount,
                start_date: new Date(newDiscount.start_date).toISOString(),
                end_date: new Date(newDiscount.end_date).toISOString()
            };

            const result = await Swal.fire({
                title: 'Confirm Discount',
                text: "Are you sure you want to create this discount?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10B981',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Yes, create it!'
            });

            if (result.isConfirmed) {
                const response = await axios.post(`${apiUrl}/discounts/`, formattedDiscount);
                setDiscounts([...discounts, response.data]);
                setShowModal(false);
                setNewDiscount({
                    name: '',
                    amount: '',
                    is_percentage: true,
                    start_date: '',
                    end_date: '',
                    code: ''
                });
                Swal.fire('Created!', 'Discount has been created.', 'success');
            }
        } catch (error) {
            console.error('Error creating discount:', error);
            Swal.fire('Error!', 'Failed to create discount.', 'error');
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Discount Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    <FiPlus className="mr-2" />
                    Add Discount
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {discounts.map((discount) => (
                                <tr key={discount.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {discount.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {discount.code || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            discount.is_percentage ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {discount.is_percentage ? (
                                                <FiPercent className="mr-1" />
                                            ) : (
                                                <FiDollarSign className="mr-1" />
                                            )}
                                            {discount.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(discount.start_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(discount.end_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(discount.id)}
                                            className="text-red-600 hover:text-red-900 mr-4"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty state */}
            {discounts.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiTag className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No discounts found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new discount.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                            Add Discount
                        </button>
                    </div>
                </div>
            )}

            {/* Add Discount Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowModal(false)}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Discount</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 gap-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Discount Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={newDiscount.name}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                                Discount Code (optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="code"
                                                id="code"
                                                value={newDiscount.code}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                                Amount *
                                            </label>
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                    {newDiscount.is_percentage ? (
                                                        <FiPercent className="h-4 w-4" />
                                                    ) : (
                                                        <FiDollarSign className="h-4 w-4" />
                                                    )}
                                                </span>
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    id="amount"
                                                    value={newDiscount.amount}
                                                    onChange={handleInputChange}
                                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    required
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="is_percentage"
                                                id="is_percentage"
                                                checked={newDiscount.is_percentage}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="is_percentage" className="ml-2 block text-sm text-gray-700">
                                                Is Percentage
                                            </label>
                                        </div>

                                        <div>
                                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                                Start Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="start_date"
                                                id="start_date"
                                                value={newDiscount.start_date}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                                                End Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="end_date"
                                                id="end_date"
                                                value={newDiscount.end_date}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Save Discount
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Discount;