const Footer = ({ onNavigate }) => (
    <footer className="bg-zinc-900 text-green-500 p-4 text-center border-t border-green-600">
        <p className="font-mono text-sm">
            © 2025 Yogesh Chandra Singh Samant |
            <button
                onClick={() => onNavigate("about")}
                className="hover:text-green-300 px-1 transition-colors"
            >
                About
            </button>
        </p>
    </footer>
);

export default Footer;
