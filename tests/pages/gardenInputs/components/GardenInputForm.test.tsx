import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import GardenInputForm from '../../../../src/pages/gardenInputs/components/GardenInputForm';
import { t } from '../../../../src/i18n/core/t';

describe('GardenInputForm', () => {
  it('renders form with default values and toggles action chips', async () => {
    const user = userEvent.setup();

    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText(/Nombre \*/i);
    expect(nameInput).toBeInTheDocument();

    const fertilizerChip = screen.getByRole('button', { name: 'Fertilizante' });
    expect(fertilizerChip).toHaveAttribute('aria-pressed', 'false');

    await user.click(fertilizerChip);
    expect(fertilizerChip).toHaveAttribute('aria-pressed', 'true');

    await user.click(fertilizerChip);
    expect(fertilizerChip).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders external error alert when provided', () => {
    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        externalError="Error externo al procesar"
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Error externo al procesar'
    );
  });

  it('calls onCancel when clicking cancel button', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );

    const cancelBtn = screen.getByRole('button', {
      name: t('gardenInput.form.cancel')
    });
    await user.click(cancelBtn);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('allows adding, updating and removing an image resource', async () => {
    const user = userEvent.setup();

    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const addImgBtn = screen.getByRole('button', {
      name: t('gardenInput.form.resource_add_image')
    });
    await user.click(addImgBtn);

    const urlInput = screen.getByPlaceholderText(
      t('gardenInput.form.resource_image_url_placeholder')
    );
    await user.type(urlInput, 'https://example.com/foto.jpg');
    expect(urlInput).toHaveValue('https://example.com/foto.jpg');

    const removeImgBtn = screen.getByRole('button', {
      name: new RegExp(t('gardenInput.form.resource_remove_image'))
    });
    await user.click(removeImgBtn);

    expect(
      screen.queryByPlaceholderText(
        t('gardenInput.form.resource_image_url_placeholder')
      )
    ).not.toBeInTheDocument();
  });

  it('allows adding, updating and removing a video resource', async () => {
    const user = userEvent.setup();

    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const addVideoBtn = screen.getByRole('button', {
      name: t('gardenInput.form.resource_add_video')
    });
    await user.click(addVideoBtn);

    const urlInput = screen.getByPlaceholderText(
      t('gardenInput.form.resource_video_url_placeholder')
    );
    await user.type(urlInput, 'https://youtube.com/watch?v=123');
    expect(urlInput).toHaveValue('https://youtube.com/watch?v=123');

    const removeVideoBtn = screen.getByRole('button', {
      name: new RegExp(t('gardenInput.form.resource_remove_video'))
    });
    await user.click(removeVideoBtn);

    expect(
      screen.queryByPlaceholderText(
        t('gardenInput.form.resource_video_url_placeholder')
      )
    ).not.toBeInTheDocument();
  });

  it('allows adding, updating and removing an article resource', async () => {
    const user = userEvent.setup();

    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const addArticleBtn = screen.getByRole('button', {
      name: t('gardenInput.form.resource_add_article')
    });
    await user.click(addArticleBtn);

    const urlInput = screen.getByPlaceholderText(
      t('gardenInput.form.resource_article_url_placeholder')
    );
    await user.type(urlInput, 'https://example.com/guia');
    expect(urlInput).toHaveValue('https://example.com/guia');

    const removeArticleBtn = screen.getByRole('button', {
      name: new RegExp(t('gardenInput.form.resource_remove_article'))
    });
    await user.click(removeArticleBtn);

    expect(
      screen.queryByPlaceholderText(
        t('gardenInput.form.resource_article_url_placeholder')
      )
    ).not.toBeInTheDocument();
  });

  it('allows adding and removing a recipe', async () => {
    const user = userEvent.setup();

    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const addRecipeBtn = screen.getByRole('button', {
      name: new RegExp(t('gardenInput.form.add_recipe'))
    });
    await user.click(addRecipeBtn);

    expect(
      screen.getByPlaceholderText(t('gardenInput.form.recipe_name_placeholder'))
    ).toBeInTheDocument();

    const removeRecipeBtn = screen.getByRole('button', {
      name: new RegExp(t('gardenInput.form.remove_recipe'))
    });
    await user.click(removeRecipeBtn);

    expect(
      screen.queryByPlaceholderText(
        t('gardenInput.form.recipe_name_placeholder')
      )
    ).not.toBeInTheDocument();
  });

  it('allows adding and removing ingredients within a recipe', async () => {
    const user = userEvent.setup();

    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const addRecipeBtn = screen.getByRole('button', {
      name: new RegExp(t('gardenInput.form.add_recipe'))
    });
    await user.click(addRecipeBtn);

    const addIngBtn = screen.getByRole('button', {
      name: new RegExp(t('gardenInput.form.add_ingredient'))
    });
    await user.click(addIngBtn);

    const ingInputs = screen.getAllByPlaceholderText(
      t('gardenInput.form.ingredient_item_placeholder')
    );
    expect(ingInputs).toHaveLength(2);

    const removeIngBtns = screen.getAllByRole('button', {
      name: new RegExp(t('gardenInput.form.remove_ingredient'))
    });
    await user.click(removeIngBtns[0]);

    expect(
      screen.getAllByPlaceholderText(
        t('gardenInput.form.ingredient_item_placeholder')
      )
    ).toHaveLength(1);
  });

  it('allows adding and removing instructions within a recipe', async () => {
    const user = userEvent.setup();

    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const addRecipeBtn = screen.getByRole('button', {
      name: new RegExp(t('gardenInput.form.add_recipe'))
    });
    await user.click(addRecipeBtn);

    const addInstBtn = screen.getByRole('button', {
      name: new RegExp(t('gardenInput.form.add_instruction'))
    });
    await user.click(addInstBtn);

    const instInputs = screen.getAllByPlaceholderText(
      new RegExp(t('gardenInput.form.instruction_placeholder'))
    );
    expect(instInputs).toHaveLength(2);

    const removeInstBtns = screen.getAllByRole('button', {
      name: new RegExp(t('gardenInput.form.remove_instruction'))
    });
    await user.click(removeInstBtns[0]);

    expect(
      screen.getAllByPlaceholderText(
        new RegExp(t('gardenInput.form.instruction_placeholder'))
      )
    ).toHaveLength(1);
  });

  it('submits valid form calling onSubmit callback', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <GardenInputForm
        isCreate={true}
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/Nombre \*/i), 'Purín de ortiga');
    await user.type(
      screen.getByLabelText(/Identificador \(slug\) \*/i),
      'purin-ortiga'
    );

    const submitBtn = screen.getByRole('button', {
      name: t('gardenInput.form.submit_create')
    });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Purín de ortiga',
        slug: 'purin-ortiga',
        category: 'defense'
      })
    );
  });
});
