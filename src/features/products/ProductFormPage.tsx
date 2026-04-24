import { type FormEvent, useState } from 'react'
import { Button } from '../../components/actions/Button'
import { EmptyState } from '../../components/feedback/EmptyState'
import { PageHeader } from '../../components/layout/PageHeader'
import { PagePanel } from '../../components/layout/PagePanel'
import type { ProductScreen } from '../../types/app-route'
import type { ProductFormField } from '../../types/product'
import { useProductCatalog } from './hooks/useProductCatalog'
import {
  createEmptyProductForm,
  createProductFormFromItem,
  validateProductForm,
} from './model/form'
import './products.css'

type ProductFormPageProps = {
  mode: Exclude<ProductScreen, 'list'>
  productId?: number
  onBack: () => void
}

export function ProductFormPage({ mode, productId, onBack }: ProductFormPageProps) {
  const { categories, createProduct, updateProduct, getProductById } = useProductCatalog()
  const editingProduct = mode === 'edit' && typeof productId === 'number' ? getProductById(productId) : null
  const [form, setForm] = useState(() =>
    editingProduct ? createProductFormFromItem(editingProduct) : createEmptyProductForm(),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (mode === 'edit' && !editingProduct) {
    return (
      <div className="product-admin-layout">
        <PagePanel className="admin-panel">
          <EmptyState
            icon="🔍"
            title="商品が見つかりません"
            description="対象の商品が存在しないため、一覧画面へ戻って確認してください。"
            action={
              <Button variant="primary" onClick={onBack}>
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { errors: nextErrors, payload } = validateProductForm(form)
    if (!payload) {
      setErrors(nextErrors)
      return
    }

    if (mode === 'edit' && editingProduct) {
      updateProduct(editingProduct.id, payload)
    } else {
      createProduct(payload)
    }

    onBack()
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
                value={form.categoryId}
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
            <Button type="submit" variant="primary">
              保存
            </Button>
          </div>
        </form>
      </PagePanel>
    </div>
  )
}
