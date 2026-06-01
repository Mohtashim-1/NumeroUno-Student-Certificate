from frappe.model.document import Document


class AssessmentChecklistTemplate(Document):
	def validate(self):
		self.set_sequences()

	def set_sequences(self):
		for index, row in enumerate(self.criteria, start=1):
			if not row.sequence:
				row.sequence = index

		for index, row in enumerate(self.modules, start=1):
			if not row.sequence:
				row.sequence = index
