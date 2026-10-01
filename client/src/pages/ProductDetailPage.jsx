import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductDetail } from '../services/api';
import ProductInfo from '../components/ProductInfo';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage('');

    fetchProductDetail(slug)
      .then((data) => {
        if (isMounted) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const status = err.status || 500;
          setErrorStatus(status);
          setErrorMessage(err.message || 'Failed to load product');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium text-sm">Loading canvas masterpiece...</p>
      </div>
    );
  }

  if (errorStatus === 404 || !product) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Product Not Found</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              We couldn't find the chuckle canvas you were looking for. It may have been retired or moved.
            </p>
          </div>
          <div>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl text-sm hover:bg-indigo-700 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Canvases</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-red-100 space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
          <p className="text-gray-500 text-sm">{errorMessage}</p>
          <div>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl text-sm hover:bg-indigo-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Breadcrumb back */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <ProductInfo product={product} />
    </div>
  );
}
