import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const GlobalBreadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Don't show breadcrumbs on the absolute home page to keep it clean
    if (pathnames.length === 0) return null;

    return (
        <div className="hidden lg:block container mx-auto px-4 lg:px-20 py-4">
            <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 font-medium">
                <Link to="/" aria-label="Home" className="hover:opacity-70 transition-opacity">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 7.609c.352 0 .69.122.96.343l.111.1 6.25 6.25v.001a1.5 1.5 0 0 1 .445 1.071v7.5a.89.89 0 0 1-.891.891H9.125a.89.89 0 0 1-.89-.89v-7.5l.006-.149a1.5 1.5 0 0 1 .337-.813l.1-.11 6.25-6.25c.285-.285.67-.444 1.072-.444Zm5.984 7.876L16 9.5l-5.984 5.985v6.499h11.968z" fill="#475569" stroke="#475569" strokeWidth=".094"/>
                    </svg>
                </Link>

                {pathnames
                    .map((name, index) => {
                        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                        return { rawName: name, routeTo };
                    })
                    // Filter out 24-char hex strings (MongoDB IDs), pure numbers, 'undefined', and 'null'
                    .filter(b => !/^[0-9a-fA-F]{24}$/.test(b.rawName) && !/^\d+$/.test(b.rawName) && b.rawName.toLowerCase() !== 'undefined' && b.rawName.toLowerCase() !== 'null')
                    .map((b, index, arr) => {
                        const isLast = index === arr.length - 1;
                        let cleanName = '';
                        try {
                            cleanName = decodeURIComponent(b.rawName).replace(/-/g, ' ');
                        } catch (e) {
                            cleanName = b.rawName.replace(/-/g, ' ');
                        }

                        return (
                            <React.Fragment key={b.routeTo}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m14.413 10.663-6.25 6.25a.939.939 0 1 1-1.328-1.328L12.42 10 6.836 4.413a.939.939 0 1 1 1.328-1.328l6.25 6.25a.94.94 0 0 1-.001 1.328" fill="#CBD5E1"/>
                                </svg>
                                {isLast ? (
                                    <span className="text-[#c24100] capitalize font-medium">{cleanName}</span>
                                ) : (
                                    <span className="text-gray-700 capitalize">{cleanName}</span>
                                )}
                            </React.Fragment>
                        );
                })}
            </div>
        </div>
    );
};

export default GlobalBreadcrumbs;
