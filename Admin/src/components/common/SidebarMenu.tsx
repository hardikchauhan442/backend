"use client";

import { useAuth } from "@/contexts/AuthContext";

import { Menu, MenuProps } from "antd";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

type MenuItem = Required<MenuProps>["items"][number];

interface SidebarMenuProps {
  items: MenuItem[];
}

export function SidebarMenu({ items }: SidebarMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Find the selected keys based on current path
  const selectedKeys = useMemo(() => {
    const keys: string[] = [];

    const findSelectedKey = (menuItems: MenuItem[] = []) => {
      for (const item of menuItems) {
        if (item && "children" in item && item.children) {
          findSelectedKey(item.children);
        }

        if (item && "href" in item && item.href) {
          if (pathname.startsWith(item.href as string)) {
            keys.push(item.key as string);
          }
        }
      }
    };

    findSelectedKey(items);
    return keys;
  }, [pathname, items]);

  // Find the open keys based on current path
  const openKeys = useMemo(() => {
    const keys: string[] = [];

    const findOpenKeys = (menuItems: MenuItem[] = []) => {
      for (const item of menuItems) {
        if (item && "children" in item && item.children) {
          const hasActiveChild = item.children.some(
            (child) =>
              child &&
              "href" in child &&
              child.href &&
              pathname.startsWith(child.href as string)
          );

          if (hasActiveChild) {
            keys.push(item.key as string);
          }

          findOpenKeys(item.children);
        }
      }
    };

    findOpenKeys(items);
    return keys;
  }, [pathname, items]);

  const onMenuClick: MenuProps["onClick"] = (e) => {
    const { key } = e;
    const menuItem = findMenuItem(items, key);

    if (menuItem && "href" in menuItem && menuItem.href) {
      router.prefetch(menuItem.href as string);
      redirect(menuItem.href as string);
    }
  };

  // Helper function to find a menu item by key
  const findMenuItem = (
    menuItems: MenuItem[] = [],
    targetKey: string
  ): MenuItem | null => {
    for (const item of menuItems) {
      if (!item) continue;

      if (item.key === targetKey) {
        return item;
      }

      if ("children" in item && item.children) {
        const found = findMenuItem(item.children, targetKey);
        if (found) return found;
      }
    }
    return null;
  };

  // Filter menu items based on user roles
  const filterMenuItems = (menuItems: MenuItem[] = []): MenuItem[] => {
    if (!user) return [];

    return menuItems.filter((item: any) => {
      if (!item) return false;

      // If item has roles, check if user has any of the required roles
      if ("roles" in item && item.roles) {
        return item.roles.includes(user.role as string);
      }

      // If item has children, filter them as well
      if ("children" in item && item.children) {
        const filteredChildren = filterMenuItems(item.children);
        return filteredChildren.length > 0;
      }

      return true;
    });
  };

  const filteredItems = useMemo(() => filterMenuItems(items), [items, user]);

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={selectedKeys}
      defaultOpenKeys={openKeys}
      onClick={onMenuClick}
      items={filteredItems}
      style={{
        borderRight: 0,
        background: "transparent",
        padding: "8px 0",
      }}
    />
  );
}
