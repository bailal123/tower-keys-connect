import React from 'react'

const DesignsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Unit Designs
          </h1>
          <p className="text-gray-600 mt-1">
            Manage unit designs with full CRUD operations and copy functionality
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Unit Designs (0)
            </h3>
            
            <div className="text-center py-8">
              <p className="text-gray-500">No designs found. Click "Add New" to create your first design.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignsPage