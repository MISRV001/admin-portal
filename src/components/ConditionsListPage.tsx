import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConditionCard } from '@/components/ConditionCard';
import { ConditionFormModal } from '@/components/ConditionFormModal';
import { useConditionStore } from '@/stores/conditionStore';

const CONDITION_TYPES = [
	'GEOGRAPHICAL',
	'WEATHER',
	'TEMPORAL',
	'DEMOGRAPHIC',
	'PURCHASE',
	'INVENTORY',
];

export const ConditionsListPage: React.FC = () => {
	const {
		conditions,
		loading,
		error,
		fetchConditions,
		addCondition,
		updateCondition,
		deleteCondition,
		toggleCondition,
	} = useConditionStore();
	const [filtered, setFiltered] = useState<any[]>([]);
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [selected, setSelected] = useState<string[]>([]);
	const [editCondition, setEditCondition] = useState<any | null>(null);

	useEffect(() => {
		fetchConditions();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		let data = [...conditions];
		if (search)
			data = data.filter((c) =>
				c.name.toLowerCase().includes(search.toLowerCase())
			);
		if (typeFilter) data = data.filter((c) => c.type === typeFilter);
		setFiltered(data);
	}, [search, typeFilter, conditions]);

	const toggleSelect = (id: string) => {
		setSelected((sel) =>
			sel.includes(id)
				? sel.filter((s) => s !== id)
				: [...sel, id]
		);
	};

	const bulkEnable = () => {
		selected.forEach((id) => toggleCondition(id));
		setSelected([]);
	};
	const bulkDisable = () => {
		selected.forEach((id) => toggleCondition(id));
		setSelected([]);
	};
	const bulkDelete = () => {
		selected.forEach((id) => deleteCondition(id));
		setSelected([]);
	};

	const handleSave = async (cond: any) => {
		if (editCondition) {
			await updateCondition(cond.id, cond);
		} else {
			await addCondition(cond);
		}
		setShowModal(false);
		setEditCondition(null);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
				<div className="flex gap-2">
					<Input
						placeholder="Search conditions..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-64"
					/>
					<select
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value)}
						className="border rounded px-2 py-1"
					>
						<option value="">All Types</option>
						{CONDITION_TYPES.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={() => {
							setShowModal(true);
							setEditCondition(null);
						}}
						className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow px-6 py-2"
					>
						+ Add Condition
					</Button>
					<Button
						variant="outline"
						disabled={selected.length === 0}
						onClick={bulkEnable}
					>
						Enable
					</Button>
					<Button
						variant="outline"
						disabled={selected.length === 0}
						onClick={bulkDisable}
					>
						Disable
					</Button>
					<Button
						variant="destructive"
						disabled={selected.length === 0}
						onClick={bulkDelete}
					>
						Delete
					</Button>
				</div>
			</div>
			<Card className="overflow-x-auto">
				<CardContent className="p-0">
					{error && <div className="p-4 text-red-600">{error}</div>}
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50">
							<tr>
								<th className="p-2">
									<input
										type="checkbox"
										checked={
											selected.length === filtered.length &&
											filtered.length > 0
										}
										onChange={(e) =>
											setSelected(
												e.target.checked
													? filtered.map((c) => c.id)
													: []
											)
										}
									/>
								</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={8} className="p-4 text-center">
										Loading...
									</td>
								</tr>
							) : filtered.length === 0 ? (
								<tr>
									<td colSpan={8} className="p-4 text-center">
										No conditions found.
									</td>
								</tr>
							) : (
								filtered.map((cond) => (
									<tr
										key={cond.id}
										className={
											selected.includes(cond.id)
												? 'bg-blue-50'
												: ''
										}
									>
										<td className="p-2">
											<input
												type="checkbox"
												checked={selected.includes(cond.id)}
												onChange={() => toggleSelect(cond.id)}
											/>
										</td>
										<td colSpan={7} className="p-2">
											<ConditionCard
												condition={cond}
												onEdit={() => {
													setEditCondition(cond);
													setShowModal(true);
												}}
												onDelete={() => deleteCondition(cond.id)}
											/>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</CardContent>
			</Card>
			{showModal && (
				<ConditionFormModal
					onClose={() => {
						setShowModal(false);
						setEditCondition(null);
					}}
					onSave={handleSave}
					initial={editCondition}
				/>
			)}
		</div>
	);
};
