import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export default function WritingShell({ children }: Props) {
    return (
        <div className="writing-site">
            <div className="writing-atmosphere" aria-hidden="true" />
            <div className="writing-site-inner">{children}</div>
        </div>
    );
}
