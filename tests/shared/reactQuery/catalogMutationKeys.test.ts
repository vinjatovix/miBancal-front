import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import {
  catalogEditKeys,
  invalidateFamilyQueries,
  invalidatePlantQueries
} from '../../../src/shared/reactQuery/catalogMutationKeys';

describe('catalogEditKeys', () => {
  it('generates consistent plantEdit query key', () => {
    const key = catalogEditKeys.plantEdit('plant-1');

    expect(key).toEqual(['plants', 'edit', 'plant-1']);
  });

  it('generates consistent familyEdit query key', () => {
    const key = catalogEditKeys.familyEdit('solanaceae');

    expect(key).toEqual(['families', 'edit', 'solanaceae']);
  });
});

describe('invalidatePlantQueries', () => {
  it('invalidates plant keys with specific plant ID', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidatePlantQueries(queryClient, 'plant-1');

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['plants'] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['plants', 'detail', 'plant-1']
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['plants', 'edit', 'plant-1']
    });
  });

  it('invalidates general plant keys when plant ID is omitted', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidatePlantQueries(queryClient);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['plants'] });
  });
});

describe('invalidateFamilyQueries', () => {
  it('invalidates family and dependent plant keys with specific family ID or slug', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateFamilyQueries(queryClient, 'solanaceae');

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['families'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['plants'] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['families', 'detail', 'solanaceae']
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['families', 'edit', 'solanaceae']
    });
  });

  it('invalidates general family and plant keys when ID is omitted', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateFamilyQueries(queryClient);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['families'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['plants'] });
  });
});
