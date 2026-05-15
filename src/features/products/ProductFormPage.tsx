import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '../../components/actions/Button'
import { EmptyState } from '../../components/feedback/EmptyState'
import { LoadingState } from '../../components/feedback/LoadingState'
import { PageHeader } from '../../components/layout/PageHeader'
import { PagePanel } from '../../components/layout/PagePanel'
import { buildAssetUrl } from '../../lib/api/client'
import type { ProductScreen } from '../../types/app-route'
import type { ProductFormField } from '../../types/product'
import { useProductCatalog } from './hooks/useProductCatalog'
import { uploadProductImage } from './api/productCatalogRepository'
import {
  createEmptyProductForm,
  createProductFormFromItem,
  validateProductForm,
} from './model/form'
import './products.css'

const IMAGE_MAX_SIZE = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

type ProductFormPageProps = {
  mode: Exclude<ProductScreen, 'list'>
  productId?: number
  onBack: () => void
}

export function ProductFormPage({ mode, productId, onBack }: ProductFormPageProps) {
  const { categories, createProduct, updateProduct, getProductById, isLoading } = useProductCatalog()
  const editingProduct = mode === 'edit' && typeof productId === 'number' ? getProductById(productId) : null
  const [form, setForm] = useState(() =>
    editingProduct ? createProductFormFromItem(editingProduct) : createEmptyProductForm(categories),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null)
  const selectedImagePreviewUrlRef = useRef<string | null>(null)
  const effectiveCategoryId = form.categoryId || (categories[0] ? String(categories[0].id) : '')
  const imagePreviewUrl = selectedImagePreviewUrl ?? (form.imagePath ? buildAssetUrl(form.imagePath) : '')

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrlRef.current) {
        URL.revokeObjectURL(selectedImagePreviewUrlRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="product-admin-layout">
        <PagePanel className="admin-panel">
          <LoadingState
            title="商品マスタを読み込み中です"
            description="編集に必要なカテゴリと商品一覧を取得しています。"
          />
        </PagePanel>
      </div>
    )
  }

  if (mode === 'edit' && !editingProduct) {
    return (
      <div className="product-admin-layout">
        <PagePanel className="admin-panel">
          <EmptyState
            icon="🔍"
            title="商品が見つかりません"
            description="対象の商品が存在しないため、一覧画面へ戻って確認してください。"
            action={
              <Button className="px-4 py-2" variant="primary" onClick={onBack}>
                商品一覧へ戻る
              </Button>
            }
            className="admin-empty-state"
          />
        </PagePanel>
      </div>
    )
  }

  const updateField = <Field extends ProductFormField>(field: Field, value: (typeof form)[Field]) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const clearSelectedImage = () => {
    setSelectedImageFile(null)
    if (selectedImagePreviewUrlRef.current) {
      URL.revokeObjectURL(selectedImagePreviewUrlRef.current)
      selectedImagePreviewUrlRef.current = null
    }
    setSelectedImagePreviewUrl(null)
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0] ?? null

    if (!imageFile) {
      clearSelectedImage()
      return
    }

    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      clearSelectedImage()
      setErrors((currentErrors) => ({
        ...currentErrors,
        imagePath: '画像は JPEG, PNG, GIF, WebP のいずれかを選択してください。',
      }))
      event.target.value = ''
      return
    }

    if (imageFile.size > IMAGE_MAX_SIZE) {
      clearSelectedImage()
      setErrors((currentErrors) => ({
        ...currentErrors,
        imagePath: '画像は2MB以内で選択してください。',
      }))
      event.target.value = ''
      return
    }

    if (selectedImagePreviewUrlRef.current) {
      URL.revokeObjectURL(selectedImagePreviewUrlRef.current)
    }

    const previewUrl = URL.createObjectURL(imageFile)
    selectedImagePreviewUrlRef.current = previewUrl
    setSelectedImageFile(imageFile)
    setSelectedImagePreviewUrl(previewUrl)
    setErrors((currentErrors) => {
      if (!currentErrors.imagePath) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors.imagePath
      return nextErrors
    })
  }

  const clearImage = () => {
    clearSelectedImage()
    updateField('imagePath', '')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { errors: nextErrors, payload } = validateProductForm(
      { ...form, categoryId: effectiveCategoryId },
      categories,
    )
    if (!payload) {
      setErrors(nextErrors)
      return
    }

    setIsSaving(true)
    setErrors({})

    try {
      const imagePath = selectedImageFile
        ? await uploadProductImage(selectedImageFile)
        : payload.imagePath
      const productPayload = { ...payload, imagePath }

      if (mode === 'edit' && editingProduct) {
        await updateProduct(editingProduct.id, productPayload)
      } else {
        await createProduct(productPayload)
      }

      onBack()
    } catch (error: unknown) {
      setErrors({
        form: error instanceof Error ? error.message : '商品の保存に失敗しました。',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="product-admin-layout">
      <PagePanel className="admin-form-panel">
        <PageHeader
          kicker={mode === 'edit' ? 'Edit product' : 'Create product'}
          title={mode === 'edit' ? '商品編集' : '商品登録'}
          description={
            mode === 'edit'
              ? '既存商品の内容を更新します。'
              : 'レジ画面に表示する商品を新規登録します。'
          }
        />

        <form className="admin-form" onSubmit={handleSubmit}>
          {errors.form ? <p className="form-error-text">{errors.form}</p> : null}

          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>商品名</span>
              <input
                type="text"
                className="admin-input"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="商品名を入力"
              />
              {errors.name ? <small className="form-error-text">{errors.name}</small> : null}
            </label>

            <label className="admin-form-field">
              <span>価格</span>
              <input
                type="number"
                min="0"
                max="999999"
                className="admin-input"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                placeholder="0"
              />
              {errors.price ? <small className="form-error-text">{errors.price}</small> : null}
            </label>

            <label className="admin-form-field">
              <span>カテゴリ</span>
              <select
                className="admin-select"
                value={effectiveCategoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId ? (
                <small className="form-error-text">{errors.categoryId}</small>
              ) : null}
            </label>

            <label className="admin-form-field">
              <span>アイコン</span>
              <input
                type="text"
                className="admin-input"
                value={form.icon}
                onChange={(event) => updateField('icon', event.target.value)}
                placeholder="🍓"
              />
              {errors.icon ? <small className="form-error-text">{errors.icon}</small> : null}
            </label>

            <div className="admin-form-field admin-image-field">
              <span>商品画像</span>
              <div className="admin-image-upload">
                {imagePreviewUrl ? (
                  <img className="admin-image-preview" src={imagePreviewUrl} alt="" />
                ) : (
                  <span className="admin-image-empty">画像なし</span>
                )}
                <div className="admin-image-controls">
                  <input
                    type="file"
                    className="admin-file-input"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                  />
                  {imagePreviewUrl ? (
                    <Button type="button" variant="ghost" onClick={clearImage}>
                      画像を削除
                    </Button>
                  ) : null}
                </div>
              </div>
              {errors.imagePath ? (
                <small className="form-error-text">{errors.imagePath}</small>
              ) : null}
            </div>

            <label className="admin-form-field">
              <span>並び順</span>
              <input
                type="number"
                min="0"
                className="admin-input"
                value={form.sortOrder}
                onChange={(event) => updateField('sortOrder', event.target.value)}
                placeholder="0"
              />
              {errors.sortOrder ? (
                <small className="form-error-text">{errors.sortOrder}</small>
              ) : null}
            </label>

            <label className="admin-switch-field">
              <span>表示状態</span>
              <span className="admin-switch-control">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateField('isActive', event.target.checked)}
                />
                <strong>{form.isActive ? '表示中' : '非表示'}</strong>
              </span>
            </label>
          </div>

          <div className="admin-form-actions">
            <Button variant="ghost" onClick={onBack}>
              キャンセル
            </Button>
            <Button className="px-4 py-2" type="submit" variant="primary" disabled={isSaving || categories.length === 0}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </PagePanel>
    </div>
  )
}
