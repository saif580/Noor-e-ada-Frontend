import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { adminApi, type AdminCategoryPayload, type AdminLowStockVariant, type AdminOrder, type AdminProductPayload, type AdminUser } from '../../api/admin';
import { Alert } from '../../components/ui/Alert';
import { EmptyState, LoadingState } from '../../components/ui/AsyncState';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import type { Category, Order, Product, UserRole } from '../../types/domain';

type AdminSection = 'overview' | 'products' | 'categories' | 'orders' | 'users' | 'inventory';

const adminSections: Array<{ id: AdminSection; label: string; path: string }> = [
  { id: 'overview', label: 'Overview', path: '/admin' },
  { id: 'products', label: 'Products', path: '/admin/products' },
  { id: 'categories', label: 'Collections', path: '/admin/categories' },
  { id: 'orders', label: 'Orders', path: '/admin/orders' },
  { id: 'users', label: 'Customers', path: '/admin/users' },
  { id: 'inventory', label: 'Inventory', path: '/admin/inventory' },
];

const orderStatuses: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const emptyProductForm: AdminProductPayload = {
  categoryId: '',
  name: '',
  slug: '',
  description: '',
  basePrice: 1499,
  popularityScore: 0,
  isActive: true,
  variants: [{
    sku: '',
    color: '',
    size: '',
    material: '',
    price: 1499,
    compareAtPrice: null,
    inventoryQuantity: 10,
    lowStockThreshold: 3,
    isActive: true,
  }],
  images: [{ imageUrl: '', altText: '', sortOrder: 0 }],
  attributes: [{ name: 'Care', value: 'Dry clean recommended' }],
};

const emptyCategoryForm: AdminCategoryPayload = {
  name: '',
  slug: '',
  description: '',
  parentId: null,
  imageUrl: '',
  isActive: true,
};

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value ?? 0);

const formatDate = (value?: string) => (
  value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not available'
);

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

const productToForm = (product: Product): AdminProductPayload => ({
  categoryId: product.categoryId ?? '',
  name: product.name,
  slug: product.slug,
  description: product.description ?? '',
  basePrice: product.basePrice ?? product.minPrice ?? 1499,
  popularityScore: product.popularityScore ?? 0,
  isActive: product.isActive !== false,
  variants: product.variants.length > 0
    ? product.variants.map((variant) => ({
        sku: variant.sku,
        color: variant.color ?? '',
        size: variant.size ?? '',
        material: variant.material ?? '',
        price: variant.price,
        compareAtPrice: variant.compareAtPrice ?? null,
        inventoryQuantity: variant.stockQuantity,
        lowStockThreshold: variant.lowStockThreshold ?? 3,
        isActive: variant.isActive !== false,
      }))
    : emptyProductForm.variants,
  images: product.images.length > 0
    ? product.images.map((image) => ({
        imageUrl: image.url,
        altText: image.altText ?? product.name,
        sortOrder: image.sortOrder,
      }))
    : emptyProductForm.images,
  attributes: product.attributes
    ? Object.entries(product.attributes).map(([name, value]) => ({ name, value }))
    : emptyProductForm.attributes,
});

const categoryToForm = (category: Category): AdminCategoryPayload => ({
  name: category.name,
  slug: category.slug,
  description: category.description ?? '',
  parentId: category.parentId ?? null,
  imageUrl: category.imageUrl ?? '',
  isActive: category.isActive !== false,
});

function AdminShell({
  section,
  children,
}: {
  section: AdminSection;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <main className="admin-console">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-sidebar-brand">Noor-e-ada Admin</Link>
        <nav aria-label="Admin navigation">
          {adminSections.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={item.id === section ? 'is-active' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span>{user?.email}</span>
          <Link to="/">View storefront</Link>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <section className="admin-main">
        {children}
      </section>
    </main>
  );
}

function AdminHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="admin-page-header">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

export function AdminDashboardPage() {
  const { section } = useParams();
  const activeSection = (section ?? 'overview') as AdminSection;
  const validSection = adminSections.some((item) => item.id === activeSection);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [lowStock, setLowStock] = useState<AdminLowStockVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState<UserRole | ''>('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<AdminProductPayload>(emptyProductForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<AdminCategoryPayload>(emptyCategoryForm);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productResult, categoryResult, orderResult, userResult, lowStockResult] = await Promise.all([
        adminApi.listProducts({ q: productSearch, limit: 30 }),
        adminApi.listCategories(),
        adminApi.listOrders({ q: orderSearch, status: orderStatus, limit: 30 }),
        adminApi.listUsers({ q: userSearch, role: userRole, limit: 30 }),
        adminApi.listLowStock(lowStockThreshold),
      ]);
      setProducts(productResult.items);
      setCategories(categoryResult);
      setOrders(orderResult.items);
      setUsers(userResult.items);
      setLowStock(lowStockResult);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load admin data.'));
    } finally {
      setLoading(false);
    }
  }, [lowStockThreshold, orderSearch, orderStatus, productSearch, userRole, userSearch]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const metrics = useMemo(() => {
    const openOrders = orders.filter((order) => ['pending', 'confirmed'].includes(order.status)).length;
    const activeProducts = products.filter((product) => product.isActive !== false).length;
    const activeUsers = users.filter((user) => user.isActive !== false).length;
    const revenue = orders.reduce((sum, order) => sum + (order.total ?? order.totals.grandTotal), 0);
    return { openOrders, activeProducts, activeUsers, revenue };
  }, [orders, products, users]);

  if (!validSection) return <Navigate to="/admin" replace />;

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const showSuccess = (text: string) => {
    setError('');
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  const handleProductSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        ...productForm,
        images: productForm.images.filter((image) => image.imageUrl.trim()),
        attributes: productForm.attributes?.filter((attribute) => attribute.name.trim() && attribute.value.trim()),
      };
      if (editingProductId) {
        await adminApi.updateProduct(editingProductId, payload);
        showSuccess('Product updated.');
      } else {
        await adminApi.createProduct(payload);
        showSuccess('Product created.');
      }
      resetProductForm();
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save product.'));
    }
  };

  const handleCategorySubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editingCategoryId) {
        await adminApi.updateCategory(editingCategoryId, categoryForm);
        showSuccess('Collection updated.');
      } else {
        await adminApi.createCategory(categoryForm);
        showSuccess('Collection created.');
      }
      resetCategoryForm();
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save collection.'));
    }
  };

  const handleProductAction = async (action: () => Promise<void>, successText: string) => {
    try {
      await action();
      showSuccess(successText);
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Product action failed.'));
    }
  };

  const handleOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      showSuccess('Order status updated.');
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update order status.'));
    }
  };

  const handleUserRole = async (userId: string, role: UserRole) => {
    try {
      await adminApi.updateUserRole(userId, role);
      showSuccess('User role updated.');
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update user role.'));
    }
  };

  const handleUserActive = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.setUserActive(userId, isActive);
      showSuccess('User status updated.');
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update user status.'));
    }
  };

  const renderOverview = () => (
    <>
      <AdminHeader
        eyebrow="Operations"
        title="Admin overview"
        description="Track catalog readiness, customer activity, order load, and inventory risk."
      />
      <div className="admin-metric-grid">
        <article><span>Active products</span><strong>{metrics.activeProducts}</strong></article>
        <article><span>Open orders</span><strong>{metrics.openOrders}</strong></article>
        <article><span>Active customers</span><strong>{metrics.activeUsers}</strong></article>
        <article><span>Visible revenue</span><strong>{formatCurrency(metrics.revenue)}</strong></article>
      </div>
      <div className="admin-two-column">
        <section className="admin-panel">
          <h2>Recent orders</h2>
          {orders.slice(0, 6).map((order) => (
            <div className="admin-list-row" key={order.id}>
              <div>
                <strong>{order.orderNumber ?? `Order #${order.id}`}</strong>
                <span>{order.user?.email ?? 'Customer'} · {formatDate(order.createdAt)}</span>
              </div>
              <mark>{order.status}</mark>
            </div>
          ))}
        </section>
        <section className="admin-panel">
          <h2>Low stock</h2>
          {lowStock.slice(0, 6).map((item) => (
            <div className="admin-list-row" key={item.variantId}>
              <div>
                <strong>{item.productName}</strong>
                <span>{item.sku} · {item.color} · {item.size}</span>
              </div>
              <mark>{item.availableQuantity} left</mark>
            </div>
          ))}
        </section>
      </div>
    </>
  );

  const renderProducts = () => (
    <>
      <AdminHeader eyebrow="Catalog" title="Products" description="Create styles, update inventory, and control product visibility." />
      <section className="admin-panel">
        <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); void loadAdminData(); }}>
          <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products" />
          <button className="button button-secondary" type="submit">Search</button>
          <button className="button button-secondary" type="button" onClick={resetProductForm}>New product</button>
        </form>
      </section>
      <section className="admin-panel">
        <h2>{editingProductId ? 'Edit product' : 'Add product'}</h2>
        <form className="admin-form-grid" onSubmit={handleProductSubmit}>
          <label>Name<input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required /></label>
          <label>Slug<input value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} placeholder="auto-generated if empty" /></label>
          <label>Collection<select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} required>
            <option value="">Select collection</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select></label>
          <label>Base price<input type="number" min="1" value={productForm.basePrice} onChange={(e) => setProductForm({ ...productForm, basePrice: Number(e.target.value) })} required /></label>
          <label>SKU<input value={productForm.variants[0]?.sku ?? ''} onChange={(e) => setProductForm({ ...productForm, variants: [{ ...productForm.variants[0], sku: e.target.value }] })} required /></label>
          <label>Color<input value={productForm.variants[0]?.color ?? ''} onChange={(e) => setProductForm({ ...productForm, variants: [{ ...productForm.variants[0], color: e.target.value }] })} required /></label>
          <label>Size<input value={productForm.variants[0]?.size ?? ''} onChange={(e) => setProductForm({ ...productForm, variants: [{ ...productForm.variants[0], size: e.target.value }] })} required /></label>
          <label>Variant price<input type="number" min="1" value={productForm.variants[0]?.price ?? 0} onChange={(e) => setProductForm({ ...productForm, variants: [{ ...productForm.variants[0], price: Number(e.target.value) }] })} required /></label>
          <label>Stock<input type="number" min="0" value={productForm.variants[0]?.inventoryQuantity ?? 0} onChange={(e) => setProductForm({ ...productForm, variants: [{ ...productForm.variants[0], inventoryQuantity: Number(e.target.value) }] })} required /></label>
          <label>Image URL<input value={productForm.images[0]?.imageUrl ?? ''} onChange={(e) => setProductForm({ ...productForm, images: [{ ...productForm.images[0], imageUrl: e.target.value }] })} /></label>
          <label className="admin-form-wide">Description<textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={4} /></label>
          <label className="admin-checkbox"><input type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })} /> Active product</label>
          <div className="admin-form-actions">
            <button className="button button-primary" type="submit">{editingProductId ? 'Update product' : 'Create product'}</button>
            {editingProductId && <button className="button button-secondary" type="button" onClick={resetProductForm}>Cancel edit</button>}
          </div>
        </form>
      </section>
      <section className="admin-panel">
        <h2>Product list</h2>
        <div className="admin-table">
          {products.map((product) => (
            <div className="admin-table-row" key={product.id}>
              <div><strong>{product.name}</strong><span>{product.categoryName ?? 'No collection'} · {formatCurrency(product.minPrice ?? product.basePrice)}</span></div>
              <mark>{product.isActive === false ? 'Hidden' : 'Active'}</mark>
              <div className="admin-row-actions">
                <button type="button" onClick={() => { setEditingProductId(product.id); setProductForm(productToForm(product)); }}>Edit</button>
                <button type="button" onClick={() => void handleProductAction(() => adminApi.updateProductStatus(product.id, product.isActive === false), 'Product visibility updated.')}>{product.isActive === false ? 'Activate' : 'Hide'}</button>
                <button type="button" onClick={() => void handleProductAction(() => adminApi.deleteProduct(product.id), 'Product deleted.')}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderCategories = () => (
    <>
      <AdminHeader eyebrow="Catalog" title="Collections" description="Manage collection pages and navigation categories." />
      <section className="admin-panel">
        <h2>{editingCategoryId ? 'Edit collection' : 'Add collection'}</h2>
        <form className="admin-form-grid" onSubmit={handleCategorySubmit}>
          <label>Name<input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required /></label>
          <label>Slug<input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} /></label>
          <label>Image URL<input value={categoryForm.imageUrl} onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })} /></label>
          <label>Parent<select value={categoryForm.parentId ?? ''} onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value || null })}>
            <option value="">No parent</option>
            {categories.filter((category) => category.id !== editingCategoryId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select></label>
          <label className="admin-form-wide">Description<textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={3} /></label>
          <label className="admin-checkbox"><input type="checkbox" checked={categoryForm.isActive} onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })} /> Active collection</label>
          <div className="admin-form-actions">
            <button className="button button-primary" type="submit">{editingCategoryId ? 'Update collection' : 'Create collection'}</button>
            {editingCategoryId && <button className="button button-secondary" type="button" onClick={resetCategoryForm}>Cancel edit</button>}
          </div>
        </form>
      </section>
      <section className="admin-panel">
        <h2>Collection list</h2>
        <div className="admin-table">
          {categories.map((category) => (
            <div className="admin-table-row" key={category.id}>
              <div><strong>{category.name}</strong><span>{category.slug}</span></div>
              <mark>{category.isActive === false ? 'Hidden' : 'Active'}</mark>
              <div className="admin-row-actions">
                <button type="button" onClick={() => { setEditingCategoryId(category.id); setCategoryForm(categoryToForm(category)); }}>Edit</button>
                <button type="button" onClick={() => void handleProductAction(() => adminApi.deleteCategory(category.id), 'Collection deleted.')}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderOrders = () => (
    <>
      <AdminHeader eyebrow="Fulfillment" title="Orders" description="Search orders and move them through fulfillment statuses." />
      <section className="admin-panel">
        <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); void loadAdminData(); }}>
          <input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Order number or customer email" />
          <select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}>
            <option value="">All statuses</option>
            {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <button className="button button-secondary" type="submit">Apply</button>
        </form>
        <div className="admin-table">
          {orders.map((order) => (
            <div className="admin-table-row" key={order.id}>
              <div><strong>{order.orderNumber ?? `Order #${order.id}`}</strong><span>{order.user?.email ?? 'Customer'} · {formatCurrency(order.total ?? order.totals.grandTotal)}</span></div>
              <mark>{order.status}</mark>
              <select value={order.status} onChange={(event) => void handleOrderStatus(order.id, event.target.value as Order['status'])}>
                {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderUsers = () => (
    <>
      <AdminHeader eyebrow="Access" title="Customers" description="Review customers, promote admins, or deactivate risky accounts." />
      <section className="admin-panel">
        <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); void loadAdminData(); }}>
          <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search name or email" />
          <select value={userRole} onChange={(event) => setUserRole(event.target.value as UserRole | '')}>
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <button className="button button-secondary" type="submit">Apply</button>
        </form>
        <div className="admin-table">
          {users.map((item) => (
            <div className="admin-table-row" key={item.id}>
              <div><strong>{item.firstName} {item.lastName}</strong><span>{item.email}</span></div>
              <select value={item.role} onChange={(event) => void handleUserRole(item.id, event.target.value as UserRole)}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <button type="button" onClick={() => void handleUserActive(item.id, item.isActive === false)}>
                {item.isActive === false ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderInventory = () => (
    <>
      <AdminHeader eyebrow="Inventory" title="Low stock monitor" description="Catch low-stock variants before customers run into unavailable products." />
      <section className="admin-panel">
        <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); void loadAdminData(); }}>
          <input type="number" min="0" value={lowStockThreshold} onChange={(event) => setLowStockThreshold(event.target.value)} placeholder="Override threshold" />
          <button className="button button-secondary" type="submit">Refresh</button>
        </form>
        <div className="admin-table">
          {lowStock.map((item) => (
            <div className="admin-table-row" key={item.variantId}>
              <div><strong>{item.productName}</strong><span>{item.sku} · {item.color} · {item.size}</span></div>
              <mark>{item.availableQuantity} available</mark>
              <span>Stock {item.inventoryQuantity} · Reserved {item.reservedQuantity}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderSection = () => {
    if (activeSection === 'products') return renderProducts();
    if (activeSection === 'categories') return renderCategories();
    if (activeSection === 'orders') return renderOrders();
    if (activeSection === 'users') return renderUsers();
    if (activeSection === 'inventory') return renderInventory();
    return renderOverview();
  };

  return (
    <AdminShell section={activeSection}>
      <Alert message={message} type="success" className="admin-alert" />
      <Alert message={error} type="error" className="admin-alert" />
      {loading ? <LoadingState title="Loading admin workspace" /> : renderSection()}
      {!loading && activeSection !== 'overview' && (
        ((activeSection === 'products' && products.length === 0)
        || (activeSection === 'categories' && categories.length === 0)
        || (activeSection === 'orders' && orders.length === 0)
        || (activeSection === 'users' && users.length === 0)
        || (activeSection === 'inventory' && lowStock.length === 0))
          ? <EmptyState title="No records found" message="Adjust filters or add new catalog content." />
          : null
      )}
    </AdminShell>
  );
}
