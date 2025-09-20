import { useState } from 'react';
import { usePOS } from '@/hooks/usePOS';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product, ProductCategory } from '@/types/pos';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const categories: ProductCategory[] = [
  'Writing Materials',
  'Paper Products', 
  'School Bags',
  'Art Supplies',
  'Office Supplies',
  'Electronics',
  'Books & References'
];

export default function ProductsPage() {
  // Use the correct hooks
  const { products, addNewProduct, updateExistingProduct, deleteExistingProduct } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: categories[0],
    stock: '',
    description: '',
    barcode: ''
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: categories[0],
      stock: '',
      description: '',
      barcode: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      description: formData.description === "" ? null : formData.description,
      barcode: formData.barcode === "" ? null : formData.barcode
    };

    if (editingProduct) {
      updateExistingProduct(editingProduct.id, productData);
      toast({
        title: 'Product Updated',
        description: `${formData.name} has been updated successfully.`
      });
      setEditingProduct(null);
    } else {
      addNewProduct(productData);
      toast({
        title: 'Product Added',
        description: `${formData.name} has been added to inventory.`
      });
      setIsAddDialogOpen(false);
    }

    resetForm();
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category as ProductCategory,
      stock: product.stock.toString(),
      description: product.description || '',
      barcode: product.barcode || ''
    });
    setEditingProduct(product);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteExistingProduct(id);
      toast({
        title: 'Product Deleted',
        description: `${name} has been removed from inventory.`
      });
    }
  };

  const productCategories = ['all', ...categories];
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="pos-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalProducts}</div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </div>
          </CardContent>
        </Card>
        <Card className="pos-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pos-warning">{lowStockProducts}</div>
              <div className="text-sm text-muted-foreground">Low Stock</div>
            </div>
          </CardContent>
        </Card>
        <Card className="pos-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{outOfStockProducts}</div>
              <div className="text-sm text-muted-foreground">Out of Stock</div>
            </div>
          </CardContent>
        </Card>
        <Card className="pos-card">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pos-success">{products.reduce((sum, p) => sum + p.stock, 0)}</div>
              <div className="text-sm text-muted-foreground">Total Inventory</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Management */}
      <Card className="pos-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <CardTitle>Product Inventory</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="pos-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <ProductFormDialog
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isEditing={false}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, descriptions, or barcodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        )}
                        {product.barcode && (
                          <div className="text-xs text-muted-foreground">
                            Barcode: {product.barcode}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-medium">₱{product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.stock === 0
                            ? 'destructive'
                            : product.stock < 10
                            ? 'secondary'
                            : 'default'
                        }
                      >
                        {product.stock === 0
                          ? 'Out of Stock'
                          : product.stock < 10
                          ? 'Low Stock'
                          : 'In Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => {
          setEditingProduct(null);
          resetForm();
        }}>
          <ProductFormDialog
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isEditing={true}
            productName={editingProduct.name}
          />
        </Dialog>
      )}
    </div>
  );
}

interface ProductFormDialogProps {
  formData: any;
  setFormData: any;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  productName?: string;
}

function ProductFormDialog({ formData, setFormData, onSubmit, isEditing, productName }: ProductFormDialogProps) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? `Edit ${productName}` : 'Add New Product'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (₱) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock Quantity *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
            placeholder="Enter barcode (optional)"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Product description (optional)"
          />
        </div>

        <Button type="submit" className="w-full pos-button">
          {isEditing ? 'Update Product' : 'Add Product'}
        </Button>
      </form>
    </DialogContent>
  );
}