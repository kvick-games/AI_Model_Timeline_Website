export function publicAssetPath(path: string) {
  const basePath = import.meta.env.BASE_URL || '/';
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}
