import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-slate-800 text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="mb-4 sm:mb-0">
          <Link href="/" className="text-xl font-bold hover:text-blue-300 transition-colors">
            Image Composer
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                href="/" 
                className="hover:text-blue-300 transition-colors"
              >
                テンプレート
              </Link>
            </li>
            <li>
              <Link 
                href="/batch" 
                className="hover:text-blue-300 transition-colors"
              >
                バッチ処理
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 