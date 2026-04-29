import { ProductForm } from '../../components/ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-8">新規商品を追加</h1>
      <ProductForm />
    </div>
  )
}
