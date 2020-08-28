<template>
  <div title="Documents">
    <div class="row justify-between items-center">
      <h1>Documents</h1>
      <div>
        <q-btn
          icon="add"
          flat
          round
          size="md"
          dense
          class="cursor-pointer q-ma-md"
          color="grey"
          @click="onAddDocument"
        />
      </div>
    </div>
    <q-list bordered separator>
      <q-item
        v-for="item in this.$store.state.dd.documents"
        :key="item.id"
        :to="{ name: 'embed-document', params: { id: item.id} }"
        clickable
        v-ripple
      >
        <q-item-section>
          <q-item-label>{{ item.name }}</q-item-label>
          <q-item-label caption>{{ item.id }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import DocumentCreationDialog from "components/dd/DocumentCreationDialog.vue";

@Component({ components: { DocumentCreationDialog } })
export default class Documents extends Vue {
  mounted() {
    this.$store.commit("init");
    // TODO remove this setAuthorization that overrides the authorization

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.$api.setAuthorization(this.$store.state.login.token);
    void this.$store.dispatch("getDocuments");
  }

  onAddDocument() {
    this.$q.dialog({ component: DocumentCreationDialog, parent: this });
  }
}
</script>
