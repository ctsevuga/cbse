const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="text-center text-gray-600 text-sm">
          <p>
            ProShop &copy; {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;