import ProjectLayout from '@/Layouts/ProjectLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    IconFolder,
    IconPlus,
    IconArrowLeft,
    IconPencil,
    IconTrash,
    IconSwatch,
    IconTag,
} from '@/Components/expense/Icons';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ProductCategoriesIndex({ project, categories }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const createForm = useForm({
        name: '',
        color: '#3B82F6',
        description: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        color: '',
        description: '',
        is_active: true,
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('projects.modules.products.categories.store', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            },
        });
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        editForm.setData({
            name: category.name,
            color: category.color || '#3B82F6',
            description: category.description || '',
            is_active: category.is_active,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editingCategory) return;
        editForm.patch(route('projects.modules.products.categories.update', [project.id, editingCategory.id]), {
            preserveScroll: true,
            onSuccess: () => setEditingCategory(null),
        });
    };

    const deleteCategory = (category) => {
        if (confirm(`Delete category "${category.name}"? Products in this category will become uncategorized.`)) {
            router.delete(route('projects.modules.products.categories.destroy', [project.id, category.id]), {
                preserveScroll: true,
            });
        }
    };

    const inputClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500';

    return (
        <ProjectLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                            <IconFolder className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Product Categories</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Organize products by category</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('projects.modules.products.index', project.id)}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <IconArrowLeft />
                            Back to Products
                        </Link>
                        <PrimaryButton onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2">
                            <IconPlus />
                            Add Category
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`${project?.name} - Product Categories`} />

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <span className="inline-flex items-center gap-1.5"><IconTag className="h-4 w-4" />Name</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <span className="inline-flex items-center gap-1.5"><IconSwatch className="h-4 w-4" />Color</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Products</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {categories?.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="font-medium text-gray-900">{category.name}</div>
                                        {category.description && (
                                            <div className="text-sm text-gray-500">{category.description}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className="inline-block h-6 w-6 rounded-full border border-gray-200"
                                        style={{ backgroundColor: category.color || '#9ca3af' }}
                                        title={category.color}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {category.products_count ?? 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(category)}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            <IconPencil className="h-4 w-4" />Edit
                                        </button>
                                        {(category.products_count ?? 0) === 0 && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteCategory(category)}
                                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-500"
                                                >
                                                    <IconTrash className="h-4 w-4" />Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!categories || categories.length === 0) && (
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <IconFolder className="h-7 w-7" />
                        </div>
                        <p className="font-medium">No categories yet.</p>
                        <p className="mt-1 text-sm">Add your first category to organize products.</p>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <Modal show onClose={() => setShowCreateModal(false)} maxWidth="md">
                    <form onSubmit={handleCreate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Add Category</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Name" />
                                <TextInput
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={createForm.errors.name} />
                            </div>
                            <div>
                                <InputLabel value="Color" />
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={createForm.data.color}
                                        onChange={(e) => createForm.setData('color', e.target.value)}
                                        className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                                    />
                                    <TextInput
                                        value={createForm.data.color}
                                        onChange={(e) => createForm.setData('color', e.target.value)}
                                        className={inputClass + ' flex-1'}
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Description" />
                                <textarea
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className={inputClass}
                                    rows={2}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="create_is_active"
                                    checked={createForm.data.is_active}
                                    onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <InputLabel htmlFor="create_is_active">Active</InputLabel>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={createForm.processing}>Create</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}

            {editingCategory && (
                <Modal show onClose={() => setEditingCategory(null)} maxWidth="md">
                    <form onSubmit={handleUpdate} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">Edit Category</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <InputLabel value="Name" />
                                <TextInput
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <InputError message={editForm.errors.name} />
                            </div>
                            <div>
                                <InputLabel value="Color" />
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={editForm.data.color}
                                        onChange={(e) => editForm.setData('color', e.target.value)}
                                        className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                                    />
                                    <TextInput
                                        value={editForm.data.color}
                                        onChange={(e) => editForm.setData('color', e.target.value)}
                                        className={inputClass + ' flex-1'}
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Description" />
                                <textarea
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className={inputClass}
                                    rows={2}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="edit_is_active"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <InputLabel htmlFor="edit_is_active">Active</InputLabel>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <SecondaryButton type="button" onClick={() => setEditingCategory(null)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={editForm.processing}>Update</PrimaryButton>
                        </div>
                    </form>
                </Modal>
            )}
        </ProjectLayout>
    );
}
