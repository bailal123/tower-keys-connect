import React from 'react'
import { Input } from '../Input'
import { Textarea } from '../Textarea'
import { useLanguage } from '../../../hooks/useLanguage'
import { MaintenanceType, GasType, type DesignFormData } from '../../../types/api'

interface ExpensesStepProps {
  formData: DesignFormData
  setFormData: (data: DesignFormData | ((prev: DesignFormData) => DesignFormData)) => void
}

const ExpensesStep: React.FC<ExpensesStepProps> = ({ formData, setFormData }) => {
  const { t } = useLanguage()

  const expenseFields = [
    {
      key: 'municipalityFees',
      label: 'رسوم البلدية',
      icon: '🏛️',
      color: 'bg-blue-50 border-blue-200',
      value: formData.municipalityFees
    },
    {
      key: 'electricityFees',
      label: 'رسوم الكهرباء',
      icon: '⚡',
      color: 'bg-yellow-50 border-yellow-200',
      value: formData.electricityFees
    },
    {
      key: 'proFees',
      label: 'رسوم احترافية',
      icon: '💼',
      color: 'bg-purple-50 border-purple-200',
      value: formData.proFees
    },
    {
      key: 'insuranceAmount',
      label: 'مبلغ التأمين',
      icon: '🛡️',
      color: 'bg-green-50 border-green-200',
      value: formData.insuranceAmount
    },
    {
      key: 'maintenanceAmount',
      label: 'مبلغ الصيانة',
      icon: '🔧',
      color: 'bg-orange-50 border-orange-200',
      value: formData.maintenanceAmount
    },
    {
      key: 'additionalExpensesAmount',
      label: 'مصاريف إضافية',
      icon: '📊',
      color: 'bg-gray-50 border-gray-200',
      value: formData.additionalExpensesAmount
    }
  ]

  const updateExpense = (key: string, value: number) => {
    setFormData(prev => ({ ...prev, [key]: Math.max(0, value) }))
  }

  const getTotalExpenses = () => {
    return formData.municipalityFees + formData.electricityFees + formData.proFees + 
           formData.insuranceAmount + formData.maintenanceAmount + formData.additionalExpensesAmount
  }

  const maintenanceOptions = [
    { value: MaintenanceType.Annual, label: 'سنوي', description: 'صيانة سنوية مشمولة', icon: '📅' },
    { value: MaintenanceType.NotIncluded, label: 'غير مشمول', description: 'المستأجر يتحمل الصيانة', icon: '❌' },
    { value: MaintenanceType.Optional, label: 'اختياري', description: 'يمكن اختيار نوع الصيانة', icon: '❓' },
    { value: MaintenanceType.Free, label: 'مجاني', description: 'صيانة مجانية', icon: '🆓' }
  ]

  const gasOptions = [
    { value: GasType.Central, label: 'مركزي', description: 'غاز مركزي للمبنى', icon: '🏢' },
    { value: GasType.Cylinder, label: 'أسطوانات', description: 'أسطوانات غاز فردية', icon: '⛽' }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('expensesAndFees') || 'المصاريف والرسوم'}
        </h3>
        <p className="text-gray-600">
          {t('specifyAllExpenses') || 'حدد جميع المصاريف والرسوم المتعلقة بالتصميم'}
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Expenses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expenseFields.map((expense) => (
            <div key={expense.key} className={`p-6 rounded-xl border ${expense.color} transition-all duration-200 hover:shadow-lg`}>
              <div className="text-center space-y-4">
                <div className="text-3xl">{expense.icon}</div>
                <h5 className="font-semibold text-gray-900">{expense.label}</h5>
                
                <div className="relative">
                  <Input
                    type="number"
                    value={expense.value}
                    onChange={(e) => updateExpense(expense.key, Number(e.target.value))}
                    min="0"
                    className="text-center pl-16"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 text-sm">درهم</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Maintenance Type */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
            <span>🔧</span>
            نوع الصيانة
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {maintenanceOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => setFormData(prev => ({ ...prev, maintenanceType: option.value }))}
                className={`
                  relative p-4 border rounded-lg cursor-pointer transition-all duration-200
                  ${formData.maintenanceType === option.value 
                    ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-center space-y-2">
                  <div className="text-2xl">{option.icon}</div>
                  <div>
                    <h6 className="font-medium text-gray-900">{option.label}</h6>
                    <p className="text-xs text-gray-600">{option.description}</p>
                  </div>
                  {formData.maintenanceType === option.value && (
                    <div className="absolute top-2 right-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gas Type */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
            <span>🔥</span>
            نوع الغاز
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            {gasOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => setFormData(prev => ({ ...prev, gasType: option.value }))}
                className={`
                  relative p-6 border rounded-xl cursor-pointer transition-all duration-200
                  ${formData.gasType === option.value 
                    ? 'ring-2 ring-green-500 border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-center space-y-3">
                  <div className="text-3xl">{option.icon}</div>
                  <div>
                    <h6 className="font-semibold text-gray-900">{option.label}</h6>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  {formData.gasType === option.value && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Expenses Description */}
        <div className="max-w-2xl mx-auto">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            وصف المصاريف الإضافية
          </label>
          <Textarea
            value={formData.additionalExpensesDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalExpensesDescription: e.target.value }))}
            rows={3}
            placeholder="اكتب تفاصيل أي مصاريف إضافية..."
            className="text-base"
          />
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            📊 ملخص المصاريف
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-blue-600">{getTotalExpenses()}</div>
              <div className="text-sm text-gray-600">إجمالي المصاريف</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-green-600">
                {maintenanceOptions.find(m => m.value === formData.maintenanceType)?.label}
              </div>
              <div className="text-sm text-gray-600">نوع الصيانة</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-orange-600">
                {gasOptions.find(g => g.value === formData.gasType)?.label}
              </div>
              <div className="text-sm text-gray-600">نوع الغاز</div>
            </div>
          </div>

          {getTotalExpenses() > 0 && (
            <div className="text-center text-sm text-gray-700">
              <p>
                المصاريف الشهرية الإضافية: <strong>{getTotalExpenses()} درهم</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpensesStep