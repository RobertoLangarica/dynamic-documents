<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <span class="text-h5">Nuevo Documento</span>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <nq-input v-model="doc_name" placeholder="Nombre del documento" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat rounded color="secondary" label="Cancelar" @click="onCancel" />
        <q-btn rounded color="primary" label="Agregar" @click="onAdd" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>


<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { QDialog } from "quasar";

@Component({})
export default class DocumentCreationDialog extends Vue {
  doc_name: string = "";

  show() {
    (this.$refs.dialog as QDialog).show();
  }

  hide() {
    (this.$refs.dialog as QDialog).hide();
  }

  onDialogHide() {
    // required to be emitted
    // when QDialog emits "hide" event
    this.$emit("hide");
  }

  async onAdd() {
    await this.$store.dispatch("addDocument", {
      name: this.doc_name,
      description: this.doc_name,
    });
    this.$emit("ok");
    this.hide();
  }

  onCancel() {
    this.hide();
  }
}
</script>