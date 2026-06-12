export const NO_ASSIGNED_FARM_MESSAGE =
  'Brak gospodarstwa przypisanego do uzytkownika. Najpierw dodaj lub przypisz gospodarstwo.';

const ADMIN_ROLES = new Set(['Admin', 'Administrator']);

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

const toPositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const isAdminRole = (role) => ADMIN_ROLES.has(role);

export const resolveAccessibleFarms = ({ farms, owners, role, userEmail }) => {
  const safeFarms = Array.isArray(farms) ? farms : [];
  if (isAdminRole(role)) {
    return {
      farms: safeFarms,
      ownerId: null,
      scopeError: null,
    };
  }

  const normalizedEmail = normalizeEmail(userEmail);
  if (!normalizedEmail) {
    return {
      farms: [],
      ownerId: null,
      scopeError: NO_ASSIGNED_FARM_MESSAGE,
    };
  }

  const matchedOwner = (Array.isArray(owners) ? owners : []).find(
    (owner) => normalizeEmail(owner?.email) === normalizedEmail
  );
  const ownerId = toPositiveInt(matchedOwner?.id);

  if (!ownerId) {
    return {
      farms: [],
      ownerId: null,
      scopeError: NO_ASSIGNED_FARM_MESSAGE,
    };
  }

  const ownerFarms = safeFarms.filter((farm) => toPositiveInt(farm?.ownerId) === ownerId);

  return {
    farms: ownerFarms,
    ownerId,
    scopeError: ownerFarms.length === 0 ? NO_ASSIGNED_FARM_MESSAGE : null,
  };
};
