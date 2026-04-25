import { useEffect, useMemo } from 'react';
import useAuthStore from '../stores/useAuthStore';
import useZwierzeStore from '../stores/useZwierzeStore';
import useKarmienieStore from '../stores/useKarmienieStore';
import useZabiegStore from '../stores/useZabiegStore';
import Header from '../components/layout/Header';
import { Alert } from '../components/common/Common';
import styles from './StronaGlowna.module.css';

/* KpiDashboardPage — dedicated KPI dashboard tab.
   Reuses existing store data and role visibility rules without changing contracts. */

function KpiDashboardPage() {
  const { rola: role } = useAuthStore();
  const {
    zwierzeta: animals,
    ladowanie: isAnimalsLoading,
    blad: animalsError,
    pobierzWszystkie: fetchAllAnimals,
  } = useZwierzeStore();
  const {
    karmienia: feedings,
    ladowanie: isFeedingsLoading,
    blad: feedingsError,
    pobierzWszystkie: fetchAllFeedings,
  } = useKarmienieStore();
  const {
    zabiegi: treatments,
    ladowanie: isTreatmentsLoading,
    blad: treatmentsError,
    pobierzWszystkie: fetchAllTreatments,
  } = useZabiegStore();

  const canSeeAnimals = role === 'Wlasciciel' || role === 'Administrator' || role === 'Lekarz';
  const canSeeFeedings = role === 'Wlasciciel' || role === 'Administrator';
  const canSeeTreatments = role === 'Wlasciciel' || role === 'Administrator' || role === 'Lekarz';

  useEffect(() => {
    if (canSeeAnimals) {
      fetchAllAnimals();
    }
    if (canSeeFeedings) {
      fetchAllFeedings();
    }
    if (canSeeTreatments) {
      fetchAllTreatments();
    }
  }, [
    canSeeAnimals,
    canSeeFeedings,
    canSeeTreatments,
    fetchAllAnimals,
    fetchAllFeedings,
    fetchAllTreatments,
  ]);

  const kpiCards = useMemo(() => {
    const averageWeight =
      animals.length > 0
        ? animals.reduce((sum, animal) => sum + (Number(animal.waga) || 0), 0) / animals.length
        : 0;

    const totalFeedingsCost = feedings.reduce(
      (sum, feeding) => sum + (Number(feeding.cena) || 0),
      0
    );
    const totalTreatmentsCost = treatments.reduce(
      (sum, treatment) => sum + (Number(treatment.koszt) || 0),
      0
    );

    const cards = [];

    if (canSeeAnimals) {
      cards.push({
        id: 'animals-total',
        label: 'Animals',
        value: animals.length.toString(),
        helper: 'Total registered animals',
      });
      cards.push({
        id: 'animals-average-weight',
        label: 'Average weight',
        value: `${averageWeight.toFixed(1)} kg`,
        helper: 'Current herd average',
      });
    }

    if (canSeeFeedings) {
      cards.push({
        id: 'feedings-total',
        label: 'Feedings',
        value: feedings.length.toString(),
        helper: 'Recorded feeding entries',
      });
      cards.push({
        id: 'feedings-cost',
        label: 'Feed costs',
        value: `${totalFeedingsCost.toFixed(2)} PLN`,
        helper: 'Total from recorded feedings',
      });
    }

    if (canSeeTreatments) {
      cards.push({
        id: 'treatments-total',
        label: 'Treatments',
        value: treatments.length.toString(),
        helper: 'Recorded veterinary procedures',
      });
      cards.push({
        id: 'treatments-cost',
        label: 'Treatment costs',
        value: `${totalTreatmentsCost.toFixed(2)} PLN`,
        helper: 'Total treatment costs',
      });
    }

    return cards;
  }, [animals, feedings, treatments, canSeeAnimals, canSeeFeedings, canSeeTreatments]);

  const isKpiLoading =
    (canSeeAnimals && isAnimalsLoading) ||
    (canSeeFeedings && isFeedingsLoading) ||
    (canSeeTreatments && isTreatmentsLoading);

  const firstVisibleError =
    (canSeeAnimals && animalsError) ||
    (canSeeFeedings && feedingsError) ||
    (canSeeTreatments && treatmentsError) ||
    null;

  return (
    <div>
      <Header
        title="KPI Dashboard"
        subtitle="Live summary of your farm operations"
      />

      <main className={styles.dashboard}>
        <section className={styles.kpiSection}>
          {firstVisibleError && <Alert type="error">{firstVisibleError}</Alert>}

          <div className={styles.kpiGrid}>
            {kpiCards.map((card) => (
              <article className={styles.kpiCard} key={card.id}>
                <p className={styles.kpiLabel}>{card.label}</p>
                <p className={styles.kpiValue}>{card.value}</p>
                <p className={styles.kpiHelper}>{card.helper}</p>
              </article>
            ))}
          </div>

          {isKpiLoading && (
            <p className={styles.kpiLoadingText}>Refreshing KPI data...</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default KpiDashboardPage;
