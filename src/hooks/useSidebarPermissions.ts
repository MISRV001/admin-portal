import { useEffect, useState } from 'react';

export function useSidebarPermissions() {
  const [sidebarPermissions, setSidebarPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/mock/responses/sidebar-permissions.json')
      .then((res) => res.json())
      .then((data) => {
        setSidebarPermissions(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return { sidebarPermissions, loading, error };
}
