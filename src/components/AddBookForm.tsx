import React, { useState } from 'react';
import { X, Upload, BookOpen, User, Hash, Link as LinkIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddBookFormProps {
  onSubmit: (bookData: any) => Promise<void>;
  onClose: () => void;
}

export const AddBookForm: React.FC<AddBookFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    imageUrl: '',
    description: '',
    quantity: 1,
    availableQuantity: 1,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.length > 0 && formData.author.length > 0;
      case 2:
        return formData.isbn.length > 0 && formData.imageUrl.length > 0;
      case 3:
        return formData.description.length > 0;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps && isStepComplete(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Preview Panel */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6">Book Preview</h2>
              <div className="space-y-6">
                <div className="aspect-[3/4] bg-white/10 rounded-lg overflow-hidden backdrop-blur-sm">
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Book cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 text-sm">Title</p>
                    <p className="text-xl font-semibold">
                      {formData.title || 'Book Title'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Author</p>
                    <p className="text-lg">
                      {formData.author || 'Author Name'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">ISBN</p>
                    <p className="font-mono">
                      {formData.isbn || 'ISBN-XXX-XXX'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Quantity</p>
                    <p className="font-mono">
                      {formData.quantity} copies
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Progress Indicator */}
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/80">Progress</span>
                <span className="text-sm text-white/80">{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Add New Book</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Book Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
                        placeholder="Enter book title"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <User className="w-4 h-4 mr-2" />
                        Author
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => updateField('author', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
                        placeholder="Enter author name"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <Hash className="w-4 h-4 mr-2" />
                        Initial Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          updateField('quantity', value);
                          updateField('availableQuantity', value);
                        }}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
                        placeholder="Enter initial quantity"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <Hash className="w-4 h-4 mr-2" />
                        ISBN
                      </label>
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => updateField('isbn', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
                        placeholder="Enter ISBN"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Cover Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => updateField('imageUrl', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
                        placeholder="Enter image URL"
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Tip: Use high-quality book cover images from sources like Amazon or Goodreads
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                        <FileText className="w-4 h-4 mr-2" />
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors min-h-[200px] resize-none"
                        placeholder="Enter book description"
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Provide a compelling description that helps readers understand what the book is about
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  disabled={currentStep === 1}
                >
                  Previous
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  {currentStep === totalSteps ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isStepComplete(currentStep)}
                    >
                      Add Book
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={goToNextStep}
                      className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isStepComplete(currentStep)}
                    >
                      Next
                    </motion.button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};