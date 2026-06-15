'use client';

import { Button, Dropdown } from 'antd';
import type { ButtonProps } from 'antd';
import { ArrowRightIcon } from '@/components/icons';
import { CONTACT_LINKS } from '@/libs/seo';

// Built once at module scope — CONTACT_LINKS is static, so there's no reason to
// recreate this item array (and its JSX) on every render or per usage site.
const CONTACT_MENU_ITEMS = CONTACT_LINKS.map(({ key, label, href, color }) => ({
  key,
  label: (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 py-0.5"
    >
      <span
        className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
        style={{ background: color }}
      />
      {label}
    </a>
  ),
}));

/**
 * "Liên hệ" button that opens a click dropdown listing every contact channel.
 *
 * Renders its own trigger `<Button>` (rather than accepting it as children) so
 * the button lives inside this Client Component — AntD `Dropdown` clones its
 * child to attach a ref/onClick, which breaks if the child is passed across the
 * Server→Client boundary.
 */
export function ContactDropdown({
  size = 'large',
  children = 'Liên hệ',
}: {
  size?: ButtonProps['size'];
  children?: React.ReactNode;
}) {
  return (
    <Dropdown trigger={['click']} placement="bottomLeft" menu={{ items: CONTACT_MENU_ITEMS }}>
      <Button
        type="primary"
        size={size}
        shape="round"
        icon={<ArrowRightIcon />}
        iconPlacement="end"
      >
        {children}
      </Button>
    </Dropdown>
  );
}
