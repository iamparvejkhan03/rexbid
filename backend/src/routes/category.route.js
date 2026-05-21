import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    getCategoryTree,
    getActiveCategories,
    getCategoriesWithImages,
    getCategoryFields,
    addCategoryField,
    updateCategoryField,
    deleteCategoryField,
    getCategoriesByLevel,
    // New public controller methods
    getParentCategories,
    getSubcategoriesByParentSlug,
    getCategoryFieldsBySlug,
    getAllSubcategories,
    getParentCategoriesWithImages
} from '../controllers/category.controller.js';
import { auth, authAdmin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const categoryRouter = express.Router();

// =============================================
// PUBLIC ROUTES - No authentication required
// =============================================

// Get parent categories (level 0) - For auction creation
categoryRouter.get('/public/parents', getParentCategories);

// Get subcategories by parent slug - For auction creation
categoryRouter.get('/public/:parentSlug/children', getSubcategoriesByParentSlug);

// Get category fields by slug - For dynamic form rendering
categoryRouter.get('/public/by-slug/:slug/fields', getCategoryFieldsBySlug);

// Get active categories with icons (for homepage)
categoryRouter.get('/public/active', getActiveCategories);

// Get categories with images (for featured sections)
categoryRouter.get('/public/with-images', getCategoriesWithImages);

// Get all subcategories (for filters and search)
categoryRouter.get('/public/subcategories/all', getAllSubcategories);

// Get parent categories with images for homepage
categoryRouter.get('/public/parents/with-images', getParentCategoriesWithImages);

// =============================================
// ADMIN ROUTES - Authentication required
// =============================================

// All admin routes require authentication and admin privileges
categoryRouter.use(auth, authAdmin);

// Category management
categoryRouter.post('/', 
    upload.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]), 
    createCategory
);

categoryRouter.get('/', getAllCategories);
categoryRouter.get('/tree', getCategoryTree);
categoryRouter.get('/level/:level', getCategoriesByLevel);
categoryRouter.get('/:id', getCategoryById);

// Field management routes
categoryRouter.get('/:id/fields', getCategoryFields);
categoryRouter.post('/:id/fields', addCategoryField);
categoryRouter.put('/:id/fields/:fieldId', updateCategoryField);
categoryRouter.delete('/:id/fields/:fieldId', deleteCategoryField);

// Category update and delete
categoryRouter.put('/:id', 
    upload.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]), 
    updateCategory
);

categoryRouter.delete('/:id', deleteCategory);
categoryRouter.patch('/:id/toggle-status', toggleCategoryStatus);

export default categoryRouter;