import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

/* =========================
   BACKEND MATCHED SCHEMA
========================= */
const problemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']), // STRING

  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1),
      output: z.string().min(1),
      explaination: z.string().min(1) // ❗ spelling backend ke hisaab se
    })
  ).min(1),

  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1),
      output: z.string().min(1)
    })
  ).min(1),

  startCode: z.array(
    z.object({
      language: z.string(),
      initialCode: z.string().min(1)
    })
  ).length(3),

  referenceSolution: z.array(
    z.object({
      language: z.string(),
      completeCode: z.string().min(1)
    })
  ).length(3)
});

function AdminPanel() {
  const navigate = useNavigate();

  const { register, control, handleSubmit } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      visibleTestCases: [{ input: '', output: '', explaination: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const { fields: visibleFields, append: addVisible, remove: removeVisible } =
    useFieldArray({ control, name: 'visibleTestCases' });

  const { fields: hiddenFields, append: addHidden, remove: removeHidden } =
    useFieldArray({ control, name: 'hiddenTestCases' });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ================= BASIC INFO ================= */}
        <div className="card bg-base-100 shadow p-6">
          <input
            {...register('title')}
            placeholder="Title"
            className="input input-bordered w-full mb-3"
          />

          <textarea
            {...register('description')}
            placeholder="Description"
            className="textarea textarea-bordered w-full mb-3"
          />

          <select {...register('difficulty')} className="select select-bordered w-full mb-3">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select {...register('tags')} className="select select-bordered w-full">
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
          </select>
        </div>

        {/* ================= VISIBLE TEST CASES ================= */}
        <div className="card bg-base-100 shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Visible Test Cases</h2>

          {visibleFields.map((_, i) => (
            <div key={i} className="border p-4 rounded mb-3">
              <input
                {...register(`visibleTestCases.${i}.input`)}
                placeholder="Input"
                className="input input-bordered w-full mb-2"
              />
              <input
                {...register(`visibleTestCases.${i}.output`)}
                placeholder="Output"
                className="input input-bordered w-full mb-2"
              />
              <textarea
                {...register(`visibleTestCases.${i}.explaination`)}
                placeholder="Explaination"
                className="textarea textarea-bordered w-full"
              />
              <button
                type="button"
                onClick={() => removeVisible(i)}
                className="btn btn-error btn-sm mt-2"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addVisible({ input: '', output: '', explaination: '' })}
            className="btn btn-primary btn-sm"
          >
            Add Visible Case
          </button>
        </div>

        {/* ================= HIDDEN TEST CASES ================= */}
        <div className="card bg-base-100 shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Hidden Test Cases</h2>

          {hiddenFields.map((_, i) => (
            <div key={i} className="border p-4 rounded mb-3">
              <input
                {...register(`hiddenTestCases.${i}.input`)}
                placeholder="Input"
                className="input input-bordered w-full mb-2"
              />
              <input
                {...register(`hiddenTestCases.${i}.output`)}
                placeholder="Output"
                className="input input-bordered w-full"
              />
              <button
                type="button"
                onClick={() => removeHidden(i)}
                className="btn btn-error btn-sm mt-2"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addHidden({ input: '', output: '' })}
            className="btn btn-primary btn-sm"
          >
            Add Hidden Case
          </button>
        </div>

        {/* ================= CODE TEMPLATES ================= */}
        <div className="card bg-base-100 shadow p-6">
          <h2 className="text-xl font-bold mb-4">Code Templates</h2>

          {[0, 1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">
                {i === 0 ? 'C++' : i === 1 ? 'Java' : 'JavaScript'}
              </h3>

              <label className="label font-medium">Initial Code (Starter Template)</label>
              <textarea
                {...register(`startCode.${i}.initialCode`)}
                className="textarea textarea-bordered w-full mb-4 font-mono"
                rows={6}
              />

              <label className="label font-medium">Reference Solution (Complete Code)</label>
              <textarea
                {...register(`referenceSolution.${i}.completeCode`)}
                className="textarea textarea-bordered w-full font-mono"
                rows={6}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-success w-full">
          Create Problem
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;
