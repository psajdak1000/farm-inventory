import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import authService from '../../services/authService';
import ownerService from '../../services/ownerService';
import farmService from '../../services/farmService';
import Header from '../../components/layout/Header';
import { Alert, Button, Loader } from '../../components/common/Common';
import { isAdminRole } from '../../utils/ownershipScope';
import styles from './Profile.module.css';

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

function ProfilePage() {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  const [farms, setFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin =
    isAdminRole(role) || (Array.isArray(account?.roles) && account.roles.some((roleName) => isAdminRole(roleName)));

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const meResponse = await authService.fetchProfile();

        if (!isMounted) {
          return;
        }

        const resolvedRoles = Array.isArray(meResponse?.roles) && meResponse.roles.length > 0
          ? meResponse.roles
          : role
            ? [role]
            : [];

        const accountData = {
          userId: String(meResponse?.userId ?? ''),
          userName:
            String(meResponse?.userName ?? '').trim() ||
            String(user?.firstName ?? '').trim() ||
            String(user?.email ?? '').trim(),
          email: String(meResponse?.email ?? user?.email ?? '').trim(),
          roles: resolvedRoles,
          ownerId: Number.isInteger(Number(meResponse?.wlascicielId))
            ? Number(meResponse.wlascicielId)
            : null,
          farmIds: Array.isArray(meResponse?.farmIds)
            ? meResponse.farmIds
                .map((farmId) => Number(farmId))
                .filter((farmId) => Number.isInteger(farmId) && farmId > 0)
            : [],
        };

        setAccount(accountData);

        const [owners, farmList] = await Promise.all([ownerService.fetchAll(), farmService.fetchAll()]);

        if (!isMounted) {
          return;
        }

        let matchedOwner = null;

        if (accountData.ownerId) {
          matchedOwner = owners.find((ownerItem) => Number(ownerItem?.id) === accountData.ownerId) ?? null;
        }

        if (!matchedOwner && accountData.email) {
          matchedOwner =
            owners.find(
              (ownerItem) => normalizeEmail(ownerItem?.email) === normalizeEmail(accountData.email)
            ) ?? null;
        }

        setOwner(matchedOwner);

        const ownerFarms = matchedOwner
          ? farmList.filter((farmItem) => Number(farmItem?.ownerId) === Number(matchedOwner.id))
          : [];

        setFarms(ownerFarms);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Nie udalo sie pobrac danych profilu.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [role, user?.email, user?.firstName]);

  const missingOwnerOrFarmData = useMemo(() => !owner || farms.length === 0, [farms.length, owner]);

  return (
    <div>
      <Header title="Moj profil" subtitle={`Rola: ${account?.roles?.join(', ') || role || 'Nie przypisano'}`} />

      <div className={styles.profilePage}>
        {isLoading && <Loader text="Ladowanie danych..." />}
        {error && <Alert type="error">{error}</Alert>}

        {!isLoading && !error && (
          <>
            <div className={styles.profileCard}>
              <h2 className={styles.sectionTitle}>Konto</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{account?.email || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Nazwa uzytkownika</span>
                  <span className={styles.infoValue}>{account?.userName || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Role</span>
                  <span className={styles.infoValue}>{account?.roles?.join(', ') || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>UserId</span>
                  <span className={`${styles.infoValue} ${styles.mutedText}`}>{account?.userId || '-'}</span>
                </div>
              </div>
            </div>

            <div className={styles.profileCard}>
              <h2 className={styles.sectionTitle}>Wlasciciel</h2>
              {owner ? (
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Imie</span>
                    <span className={styles.infoValue}>{owner.firstName || '-'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Nazwisko</span>
                    <span className={styles.infoValue}>{owner.lastName || '-'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{owner.email || '-'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Telefon</span>
                    <span className={styles.infoValue}>{owner.phone || '-'}</span>
                  </div>
                </div>
              ) : (
                <Alert type="warning">
                  Brak danych wlasciciela lub gospodarstwa. Uzupelnij dane gospodarstwa.
                </Alert>
              )}
            </div>

            <div className={styles.profileCard}>
              <h2 className={styles.sectionTitle}>Gospodarstwo</h2>

              {farms.length > 0 ? (
                <div className={styles.farmsList}>
                  {farms.map((farmItem) => (
                    <div key={farmItem.id} className={styles.farmCard}>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Nazwa</span>
                          <span className={styles.infoValue}>{farmItem.name || '-'}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Adres</span>
                          <span className={styles.infoValue}>{farmItem.address || '-'}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Typ</span>
                          <span className={styles.infoValue}>{farmItem.type || '-'}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Powierzchnia</span>
                          <span className={styles.infoValue}>{farmItem.area} ha</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Id gospodarstwa</span>
                          <span className={`${styles.infoValue} ${styles.mutedText}`}>{farmItem.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert type="warning">
                  Brak danych wlasciciela lub gospodarstwa. Uzupelnij dane gospodarstwa.
                </Alert>
              )}

              {missingOwnerOrFarmData && !isAdmin && (
                <div className={styles.formActions}>
                  <Button variant="outline" onClick={() => navigate('/farm-setup')}>
                    Dodaj / uzupelnij gospodarstwo
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
